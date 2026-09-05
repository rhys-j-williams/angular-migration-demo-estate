import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CorrelationInterceptor, newCorrelationId } from './correlation.interceptor';

describe('CorrelationInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: CorrelationInterceptor, multi: true }],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  it('stamps IdP calls with a correlation id and channel', () => {
    http.get(`${environment.issuer}/mfa/push/abc`).subscribe();
    const req = ctrl.expectOne(`${environment.issuer}/mfa/push/abc`);
    expect(req.request.headers.get('x-channel')).toBe('keystone-web');
    expect(req.request.headers.get('x-correlation-id')).toMatch(/^[0-9a-f-]{32,36}$/);
    req.flush({});
  });

  it('leaves third party calls alone', () => {
    http.get('/assets/canopy/canopy-sprite.svg').subscribe();
    const req = ctrl.expectOne('/assets/canopy/canopy-sprite.svg');
    expect(req.request.headers.has('x-correlation-id')).toBeFalse();
    req.flush('');
  });

  it('generates distinct ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => newCorrelationId()));
    expect(ids.size).toBe(50);
  });
});
