import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { provideTestConfig } from '../../../testing/test-config';
import { AuthService } from '../auth/auth.service';
import { BearerTokenInterceptor } from './bearer-token.interceptor';

describe('BearerTokenInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const auth = { accessToken: 'ks-token-abc' as string | null };

  beforeEach(() => {
    auth.accessToken = 'ks-token-abc';
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideTestConfig(),
        { provide: AuthService, useValue: auth },
        { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('attaches the Keystone token to BFF calls', () => {
    http.get('/api/v1/accounts').subscribe();
    const req = backend.expectOne('/api/v1/accounts');
    expect(req.request.headers.get('Authorization')).toBe('Bearer ks-token-abc');
    req.flush([]);
  });

  it('attaches it to the Semaphore proxy too', () => {
    http.get('/flags/evaluate').subscribe();
    expect(backend.expectOne('/flags/evaluate').request.headers.get('Authorization')).toBe('Bearer ks-token-abc');
  });

  it('never sends the token to third party hosts (GIS-1180)', () => {
    http.get('http://localhost:4607/v4/lantern.min.js').subscribe();
    expect(backend.expectOne('http://localhost:4607/v4/lantern.min.js').request.headers.has('Authorization')).toBeFalse();
  });

  it('strips the anonymous marker and adds nothing', () => {
    http.get('/api/v1/content/disclosures', { headers: { [BearerTokenInterceptor.ANONYMOUS_HEADER]: '1' } }).subscribe();
    const req = backend.expectOne('/api/v1/content/disclosures');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.headers.has(BearerTokenInterceptor.ANONYMOUS_HEADER)).toBeFalse();
  });

  it('leaves the request alone when there is no token yet', () => {
    auth.accessToken = null;
    http.get('/api/v1/accounts').subscribe();
    expect(backend.expectOne('/api/v1/accounts').request.headers.has('Authorization')).toBeFalse();
  });
});
