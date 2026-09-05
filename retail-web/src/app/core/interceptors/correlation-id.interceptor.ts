import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Puts a fresh X-Correlation-Id on every outbound request. The BFFs (common-starter
 * CorrelationFilter) echo it into their MDC and downstream calls, so a Splunk search on the id
 * follows one click from the browser through bff-retail to txn-posting-service and back.
 *
 * Format is `mol-<page load id>-<sequence>` rather than a UUID: the page load id ties every call
 * from one tab session together, which is what support actually asks for ("everything this
 * customer did between 14:02 and 14:05"). Requested by L2 support in MOL-2318.
 *
 * Also stamps X-Mol-Client so the BFF can tell the web app from the mobile SDK in its metrics.
 */
@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  static readonly HEADER = 'X-Correlation-Id';
  static readonly CLIENT_HEADER = 'X-Mol-Client';

  readonly pageLoadId: string = CorrelationIdInterceptor.newPageLoadId();
  private sequence = 0;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.headers.has(CorrelationIdInterceptor.HEADER)) {
      // A caller (the retry interceptor, re-issuing a request) already set one. Keep it so the
      // retry shows up under the same id in Splunk.
      return next.handle(req);
    }
    this.sequence += 1;
    return next.handle(
      req.clone({
        setHeaders: {
          [CorrelationIdInterceptor.HEADER]: `${this.pageLoadId}-${this.sequence.toString(36)}`,
          [CorrelationIdInterceptor.CLIENT_HEADER]: 'retail-web'
        }
      })
    );
  }

  private static newPageLoadId(): string {
    const bytes = new Uint8Array(6);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return 'mol-' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
}
