import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/**
 * x-correlation-id on every call to the IdP or BFF so Splunk can stitch a login together across
 * keystone-web, the IdP and bff-retail. Same header name as the Java side (PLAT-0207).
 */
@Injectable()
export class CorrelationInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(environment.issuer) && !req.url.startsWith(environment.bffBaseUrl)) {
      return next.handle(req);
    }
    return next.handle(req.clone({ setHeaders: { 'x-correlation-id': newCorrelationId(), 'x-channel': 'keystone-web' } }));
  }
}

export function newCorrelationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
