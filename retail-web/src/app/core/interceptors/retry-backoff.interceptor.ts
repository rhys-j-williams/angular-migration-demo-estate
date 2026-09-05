import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

/**
 * Retries idempotent requests that fail with a 502 or 503 from the edge: those are the two codes
 * the API gateway returns while a BFF pod is being rolled (502) or is shedding load (503). Anything
 * else - 500s from the BFF itself, 4xx, network errors - is passed straight through, because
 * retrying a 500 on a payment call is how you get duplicate payments (that was MOL-2044, and the
 * reason POST is excluded even when the caller swears it is idempotent).
 *
 * Three attempts, 300ms base, doubling, with jitter so a fleet of tabs does not retry in lockstep.
 * The `X-Mol-No-Retry` header opts a request out (used by the health poll).
 */
@Injectable()
export class RetryBackoffInterceptor implements HttpInterceptor {
  static readonly NO_RETRY_HEADER = 'X-Mol-No-Retry';
  static readonly MAX_ATTEMPTS = 3;
  static readonly BASE_DELAY_MS = 300;
  private static readonly RETRYABLE_STATUS = new Set([502, 503]);
  private static readonly IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.headers.has(RetryBackoffInterceptor.NO_RETRY_HEADER)) {
      return next.handle(req.clone({ headers: req.headers.delete(RetryBackoffInterceptor.NO_RETRY_HEADER) }));
    }
    if (!RetryBackoffInterceptor.IDEMPOTENT_METHODS.has(req.method)) {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error: unknown, index: number) => {
            const attempt = index + 1;
            if (!this.isRetryable(error) || attempt >= RetryBackoffInterceptor.MAX_ATTEMPTS) {
              return throwError(() => error);
            }
            return timer(this.delayFor(attempt));
          })
        )
      )
    );
  }

  /** Exposed for the spec. Exponential with up to 25% jitter. */
  delayFor(attempt: number): number {
    const base = RetryBackoffInterceptor.BASE_DELAY_MS * Math.pow(2, attempt - 1);
    const jitter = Math.floor(Math.random() * base * 0.25);
    return base + jitter;
  }

  private isRetryable(error: unknown): boolean {
    return error instanceof HttpErrorResponse && RetryBackoffInterceptor.RETRYABLE_STATUS.has(error.status);
  }
}
