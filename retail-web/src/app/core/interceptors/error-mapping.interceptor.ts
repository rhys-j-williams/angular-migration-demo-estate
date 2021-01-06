import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { AppError, AppErrorKind } from '../errors/app-error.model';

/**
 * Turns HttpErrorResponse into AppError so components and effects deal with one shape.
 *
 * The BFFs return RFC 7807 problem details (`{ type, title, status, detail, code, correlationId }`)
 * since PLAT-611; older services still send `{ message }` or nothing. All three are handled.
 *
 * 401 from the BFF means Keystone rejected the token. We try one silent refresh here rather than
 * in the auth service because the failing request is the thing that noticed; if the refresh fails
 * the customer is logged out with reason server-401 and the original error still propagates so the
 * caller's error state renders.
 */
@Injectable()
export class ErrorMappingInterceptor implements HttpInterceptor {
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }
        const mapped = this.toAppError(err, req);
        if (mapped.kind === 'unauthenticated') {
          this.handleUnauthenticated();
        }
        return throwError(() => mapped);
      })
    );
  }

  toAppError(err: HttpErrorResponse, req: HttpRequest<unknown>): AppError {
    const body = (err.error && typeof err.error === 'object' ? err.error : {}) as Record<string, unknown>;
    const correlationId = err.headers?.get('X-Correlation-Id') ?? (body['correlationId'] as string | undefined) ?? req.headers.get('X-Correlation-Id') ?? undefined;
    const detail = (body['detail'] as string) || (body['message'] as string) || undefined;
    const code = (body['code'] as string) || undefined;

    return {
      kind: this.kindFor(err.status),
      status: err.status,
      code,
      correlationId,
      title: this.titleFor(err.status, body['title'] as string | undefined),
      detail,
      retryable: err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504,
      url: req.urlWithParams,
      method: req.method,
      fieldErrors: this.fieldErrors(body),
      raw: err
    };
  }

  private kindFor(status: number): AppErrorKind {
    if (status === 0) return 'network';
    if (status === 401) return 'unauthenticated';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'not-found';
    if (status === 409) return 'conflict';
    if (status === 422 || status === 400) return 'validation';
    if (status === 423) return 'locked';
    if (status === 429) return 'rate-limited';
    if (status >= 500) return 'server';
    return 'unknown';
  }

  private titleFor(status: number, fromBody?: string): string {
    if (fromBody) return fromBody;
    switch (status) {
      case 0: return $localize`:@@err.network:We could not reach Meridian Online. Check your connection and try again.`;
      case 401: return $localize`:@@err.401:Your session has ended. Please sign in again.`;
      case 403: return $localize`:@@err.403:You do not have access to this feature.`;
      case 404: return $localize`:@@err.404:We could not find what you were looking for.`;
      case 409: return $localize`:@@err.409:This was already done. Refresh the page to see the latest.`;
      case 423: return $localize`:@@err.423:This account is restricted. Call us on the number on the back of your card.`;
      case 429: return $localize`:@@err.429:Too many requests. Wait a moment and try again.`;
      default:
        return status >= 500
          ? $localize`:@@err.5xx:Something went wrong on our side. Nothing has been changed on your accounts.`
          : $localize`:@@err.generic:Something went wrong. Please try again.`;
    }
  }

  private fieldErrors(body: Record<string, unknown>): Record<string, string> | undefined {
    const errors = body['errors'];
    if (!Array.isArray(errors)) {
      return undefined;
    }
    const out: Record<string, string> = {};
    for (const e of errors as { field?: string; message?: string }[]) {
      if (e.field && e.message) out[e.field] = e.message;
    }
    return Object.keys(out).length ? out : undefined;
  }

  private handleUnauthenticated(): void {
    if (this.refreshInFlight) {
      return;
    }
    this.refreshInFlight = this.auth.refresh().then(ok => {
      this.refreshInFlight = null;
      if (!ok) {
        this.auth.logout('server-401');
      }
      return ok;
    });
  }
}
