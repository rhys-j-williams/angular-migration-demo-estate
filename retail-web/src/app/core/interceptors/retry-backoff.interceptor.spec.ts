import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RetryBackoffInterceptor } from './retry-backoff.interceptor';

describe('RetryBackoffInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: RetryBackoffInterceptor, multi: true }]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('retries a GET that hits a rolling pod and succeeds on the third attempt', fakeAsync(() => {
    let body: unknown;
    http.get('/api/v1/accounts').subscribe(b => (body = b));
    backend.expectOne('/api/v1/accounts').flush('', { status: 502, statusText: 'Bad Gateway' });
    tick(400);
    backend.expectOne('/api/v1/accounts').flush('', { status: 503, statusText: 'Unavailable' });
    tick(800);
    backend.expectOne('/api/v1/accounts').flush([{ accountId: 'a' }]);
    expect(body).toEqual([{ accountId: 'a' }]);
  }));

  it('gives up after three attempts', fakeAsync(() => {
    let err: HttpErrorResponse | undefined;
    http.get('/api/v1/accounts').subscribe({ error: (e: HttpErrorResponse) => (err = e) });
    for (let i = 0; i < 3; i++) {
      backend.expectOne('/api/v1/accounts').flush('', { status: 503, statusText: 'Unavailable' });
      tick(2000);
    }
    expect(err?.status).toBe(503);
  }));

  it('never retries a POST, even on 502 (MOL-2044)', fakeAsync(() => {
    let err: HttpErrorResponse | undefined;
    http.post('/api/v1/transfers', {}).subscribe({ error: (e: HttpErrorResponse) => (err = e) });
    backend.expectOne('/api/v1/transfers').flush('', { status: 502, statusText: 'Bad Gateway' });
    tick(2000);
    expect(err?.status).toBe(502);
  }));

  it('does not retry a 500 from the BFF itself', fakeAsync(() => {
    let err: HttpErrorResponse | undefined;
    http.get('/api/v1/accounts').subscribe({ error: (e: HttpErrorResponse) => (err = e) });
    backend.expectOne('/api/v1/accounts').flush('', { status: 500, statusText: 'Server Error' });
    tick(2000);
    expect(err?.status).toBe(500);
  }));

  it('honours the opt-out header and removes it', fakeAsync(() => {
    let err: HttpErrorResponse | undefined;
    http.get('/health', { headers: { [RetryBackoffInterceptor.NO_RETRY_HEADER]: '1' } }).subscribe({ error: (e: HttpErrorResponse) => (err = e) });
    const req = backend.expectOne('/health');
    expect(req.request.headers.has(RetryBackoffInterceptor.NO_RETRY_HEADER)).toBeFalse();
    req.flush('', { status: 503, statusText: 'Unavailable' });
    expect(err?.status).toBe(503);
  }));

  it('backs off exponentially with bounded jitter', () => {
    const interceptor = new RetryBackoffInterceptor();
    expect(interceptor.delayFor(1)).toBeGreaterThanOrEqual(300);
    expect(interceptor.delayFor(1)).toBeLessThan(375);
    expect(interceptor.delayFor(2)).toBeGreaterThanOrEqual(600);
    expect(interceptor.delayFor(2)).toBeLessThan(750);
  });
});
