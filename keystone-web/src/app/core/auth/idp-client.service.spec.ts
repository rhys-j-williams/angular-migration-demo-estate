import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { IdpClientService, MfaResult, PushStatus } from './idp-client.service';

describe('IdpClientService', () => {
  let svc: IdpClientService;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    svc = TestBed.inject(IdpClientService);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  it('posts the OTP as a form body with credentials and maps the landing URL', () => {
    let result: MfaResult | undefined;
    svc.submitOtp('txn-1', '123456').subscribe((r) => (result = r));
    const req = ctrl.expectOne(`${environment.issuer}/mfa`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.body).toBe('txn=txn-1&code=123456');
    expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    // HttpTestingController cannot fake a followed 303, so the landing URL is the request URL. The
    // real IdP lands on redirectUri?code=...; AuthSessionService.followIdpRedirect refuses anything
    // that is not a registered callback, which is why this value is passed through unfiltered.
    req.flush('<html></html>');
    expect(result).toEqual({ outcome: 'ok', txn: 'txn-1', redirectTo: `${environment.issuer}/mfa` });
  });

  it('maps 401 to invalid_code and 400 to expired without throwing', () => {
    const outcomes: string[] = [];
    svc.submitOtp('t', '000000').subscribe((r) => outcomes.push(r.outcome));
    ctrl.expectOne(`${environment.issuer}/mfa`).flush('', { status: 401, statusText: 'Unauthorized' });
    svc.submitTotp('t', '000000').subscribe((r) => outcomes.push(r.outcome));
    ctrl.expectOne(`${environment.issuer}/mfa`).flush('', { status: 400, statusText: 'Bad Request' });
    expect(outcomes).toEqual(['invalid_code', 'expired']);
  });

  it('rethrows anything else so the rate limit interceptor sees 429s', () => {
    let status: number | undefined;
    svc.submitOtp('t', '1').subscribe({ error: (e: { status: number }) => (status = e.status) });
    ctrl.expectOne(`${environment.issuer}/mfa`).flush('', { status: 429, statusText: 'Too Many Requests' });
    expect(status).toBe(429);
  });

  it('treats a missing /mfa/send on the mock as sent', () => {
    let dispatched = false;
    svc.requestOtp('t', 'email').subscribe(() => (dispatched = true));
    ctrl.expectOne(`${environment.issuer}/mfa/send`).flush('', { status: 404, statusText: 'Not Found' });
    expect(dispatched).toBeTrue();
  });

  it('reports pending when the push endpoint is absent', () => {
    let status: PushStatus | undefined;
    svc.pushStatus('t/1').subscribe((s) => (status = s));
    ctrl.expectOne(`${environment.issuer}/mfa/push/t%2F1`).flush('', { status: 404, statusText: 'Not Found' });
    expect(status).toEqual({ state: 'pending' });
  });
});
