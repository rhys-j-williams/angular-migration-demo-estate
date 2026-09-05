import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CorrelationIdInterceptor } from './correlation-id.interceptor';

describe('CorrelationIdInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true }]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('stamps a page-load scoped id and client marker on every request', () => {
    http.get('/api/v1/a').subscribe();
    http.get('/api/v1/b').subscribe();
    const [a, b] = backend.match(() => true);
    const idA = a.request.headers.get(CorrelationIdInterceptor.HEADER) ?? '';
    const idB = b.request.headers.get(CorrelationIdInterceptor.HEADER) ?? '';
    expect(idA).toMatch(/^mol-[0-9a-f]{12}-[0-9a-z]+$/);
    expect(idA).not.toEqual(idB);
    expect(idA.slice(0, 16)).toEqual(idB.slice(0, 16));
    expect(a.request.headers.get(CorrelationIdInterceptor.CLIENT_HEADER)).toBe('retail-web');
  });

  it('keeps an id the caller already set so retries stay under one id in Splunk', () => {
    http.get('/api/v1/a', { headers: { [CorrelationIdInterceptor.HEADER]: 'mol-retry-1' } }).subscribe();
    expect(backend.expectOne('/api/v1/a').request.headers.get(CorrelationIdInterceptor.HEADER)).toBe('mol-retry-1');
  });
});
