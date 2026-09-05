import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { RateLimitInterceptor } from './rate-limit.interceptor';
import { RateLimitStateService } from './rate-limit-state.service';

describe('RateLimitInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let state: RateLimitStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: RateLimitInterceptor, multi: true }],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    state = TestBed.inject(RateLimitStateService);
  });

  afterEach(() => ctrl.verify());

  it('raises the login scope on a 429 from /login and honours Retry-After', () => {
    let failed = false;
    http.post(`${environment.issuer}/login`, '').subscribe({ error: () => (failed = true) });
    ctrl.expectOne(`${environment.issuer}/login`).flush('', { status: 429, statusText: 'Too Many Requests', headers: { 'Retry-After': '45' } });
    expect(failed).toBeTrue();
    expect(state.isLimited).toBeTrue();
    let scope: string | null | undefined;
    state.state.subscribe((s) => (scope = s.scope)).unsubscribe();
    expect(scope).toBe('login');
  });

  it('uses the otp scope for /mfa', () => {
    http.post(`${environment.issuer}/mfa`, '').subscribe({ error: () => undefined });
    ctrl.expectOne(`${environment.issuer}/mfa`).flush('', { status: 429, statusText: 'Too Many Requests', headers: { 'Retry-After': '10' } });
    let scope: string | null | undefined;
    state.state.subscribe((s) => (scope = s.scope)).unsubscribe();
    expect(scope).toBe('otp');
  });

  it('clears the limit on the next successful IdP response', () => {
    state.limited(30, 'recovery');
    http.get(`${environment.issuer}/mfa/push/x`).subscribe();
    ctrl.expectOne(`${environment.issuer}/mfa/push/x`).flush({ state: 'pending' });
    expect(state.isLimited).toBeFalse();
  });

  it('ignores non-IdP traffic entirely', () => {
    http.get(`${environment.bffBaseUrl}/device/trust`).subscribe({ error: () => undefined });
    ctrl.expectOne(`${environment.bffBaseUrl}/device/trust`).flush('', { status: 429, statusText: 'Too Many Requests' });
    expect(state.isLimited).toBeFalse();
  });
});
