import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { RateLimitState, RateLimitStateService } from './rate-limit-state.service';

@Injectable()
export class RateLimitInterceptor implements HttpInterceptor {
  constructor(private readonly rateLimit: RateLimitStateService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(environment.issuer)) {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      tap(() => this.rateLimit.clear()),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 429) {
          const retryAfter = Number(err.headers.get('Retry-After'));
          this.rateLimit.limited(retryAfter, scopeFor(req.url));
        }
        return throwError(() => err);
      }),
    );
  }
}

function scopeFor(url: string): RateLimitState['scope'] {
  if (url.includes('/mfa')) {
    return 'otp';
  }
  if (url.includes('/recovery')) {
    return 'recovery';
  }
  return 'login';
}
