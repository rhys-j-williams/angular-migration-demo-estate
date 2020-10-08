import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../config/config.service';

/**
 * Attaches the Keystone access token to calls to our own BFF and nothing else.
 *
 * "Nothing else" is the important part. In 2021 the token went on every request, including the
 * Lantern collector and a marketing image CDN (GIS-1180 finding 2). The allow list is the BFF base
 * URL from runtime config plus the Semaphore proxy path; anything absolute pointing elsewhere is
 * left alone. Requests that opt out with the `X-Mol-Anonymous` header (config load, disclosures,
 * help content) have the marker header stripped and no token added.
 */
@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  static readonly ANONYMOUS_HEADER = 'X-Mol-Anonymous';

  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.headers.has(BearerTokenInterceptor.ANONYMOUS_HEADER)) {
      return next.handle(req.clone({ headers: req.headers.delete(BearerTokenInterceptor.ANONYMOUS_HEADER) }));
    }
    if (!this.appliesTo(req.url)) {
      return next.handle(req);
    }
    const token = this.auth.accessToken;
    if (!token) {
      return next.handle(req);
    }
    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  private appliesTo(url: string): boolean {
    if (!this.config.loaded) {
      return false;
    }
    const { apiBaseUrl, semaphore } = this.config.value;
    return url.startsWith(apiBaseUrl) || url.startsWith(semaphore.baseUrl);
  }
}
