import { Inject, Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LANTERN_CONFIG, LanternConfig, resolveConfig } from './lantern.config';
import { LanternService } from './lantern.service';

/**
 * Adds the analytics session id to outbound requests so a Splunk search on X-Analytics-Session
 * lines up BFF logs with the vendor's session view. Registered by LanternModule.forRoot through
 * HTTP_INTERCEPTORS (multi), so it sits wherever the application's own interceptors put it; the
 * BFFs read it in common-starter's CorrelationFilter and echo it into the MDC.
 *
 * Only URLs matching sessionHeaderUrlPrefixes get the header. An empty list matches everything,
 * which sends the id to third party origins too. Do not ship an empty list.
 */
@Injectable()
export class LanternSessionInterceptor implements HttpInterceptor {
  private readonly cfg: ReturnType<typeof resolveConfig>;

  constructor(
    private readonly lantern: LanternService,
    @Optional() @Inject(LANTERN_CONFIG) config: LanternConfig | null
  ) {
    this.cfg = resolveConfig(config || { writeKey: '', disabled: true });
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.applies(req)) {
      return next.handle(req);
    }
    return next.handle(req.clone({ setHeaders: { [this.cfg.sessionHeaderName]: this.lantern.sessionId() } }));
  }

  private applies(req: HttpRequest<unknown>): boolean {
    if (this.cfg.disabled || !this.cfg.attachSessionHeader || req.headers.has(this.cfg.sessionHeaderName)) {
      return false;
    }
    const prefixes = this.cfg.sessionHeaderUrlPrefixes;
    return prefixes.length === 0 || prefixes.some((p) => req.url.startsWith(p));
  }
}
