import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import { BearerTokenInterceptor } from './bearer-token.interceptor';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';
import { ErrorMappingInterceptor } from './error-mapping.interceptor';
import { HttpCacheInterceptor } from './http-cache.interceptor';
import { RetryBackoffInterceptor } from './retry-backoff.interceptor';

export { BearerTokenInterceptor, CorrelationIdInterceptor, ErrorMappingInterceptor, HttpCacheInterceptor, RetryBackoffInterceptor };

/**
 * Order matters and is the order requests flow outwards:
 *
 *   cache     - answers from memory before anything else runs
 *   bearer    - token on the way out
 *   correlate - id on the way out (after bearer so a refreshed token keeps the same id)
 *   retry     - re-issues the request below it; sits above error mapping so it sees raw
 *               HttpErrorResponse, not AppError
 *   errors    - last, closest to the backend, maps the response coming back
 *
 * Lantern's own session interceptor is added by LanternModule.forRoot and lands after these.
 */
export const HTTP_INTERCEPTOR_PROVIDERS: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: RetryBackoffInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorMappingInterceptor, multi: true }
];
