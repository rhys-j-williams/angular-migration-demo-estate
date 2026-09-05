import { HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { HttpCacheInterceptor } from './http-cache.interceptor';

class ClockedCache extends HttpCacheInterceptor {
  clock = 1_700_000_000_000;
  protected override now(): number {
    return this.clock;
  }
}

describe('HttpCacheInterceptor', () => {
  let interceptor: ClockedCache;
  let handle: jasmine.Spy<(req: HttpRequest<unknown>) => Observable<HttpResponse<unknown>>>;
  let next: HttpHandler;

  const get = (url: string, headers: Record<string, string> = {}) =>
    new HttpRequest('GET', url, { headers: new HttpHeaders(headers) });

  beforeEach(() => {
    interceptor = new ClockedCache();
    handle = jasmine.createSpy('handle').and.callFake((req: HttpRequest<unknown>) =>
      of(new HttpResponse({ status: 200, url: req.url, body: { at: Date.now() } }))
    );
    next = { handle } as HttpHandler;
  });

  it('passes through GETs that do not opt in', () => {
    interceptor.intercept(get('/api/v1/accounts'), next).subscribe();
    interceptor.intercept(get('/api/v1/accounts'), next).subscribe();
    expect(handle).toHaveBeenCalledTimes(2);
    expect(interceptor.size).toBe(0);
  });

  it('serves a second opted-in GET from memory and strips the marker header', () => {
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '1' }), next).subscribe();
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '1' }), next).subscribe();
    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle.calls.first().args[0].headers.has('X-Mol-Cache')).toBeFalse();
  });

  it('expires after the ttl', () => {
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '60' }), next).subscribe();
    interceptor.clock += 61_000;
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '60' }), next).subscribe();
    expect(handle).toHaveBeenCalledTimes(2);
  });

  it('de-duplicates concurrent in-flight requests (MOL-2760)', done => {
    handle.and.callFake((req: HttpRequest<unknown>) =>
      of(new HttpResponse({ status: 200, url: req.url, body: [] })).pipe(delay(5))
    );
    let completed = 0;
    for (let i = 0; i < 6; i++) {
      interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '1' }), next).subscribe(() => {
        completed += 1;
        if (completed === 6) {
          expect(handle).toHaveBeenCalledTimes(1);
          done();
        }
      });
    }
  });

  it('invalidates the collection and its siblings on a write to the same resource', () => {
    interceptor.intercept(get('/api/v1/transfers', { 'X-Mol-Cache': '1' }), next).subscribe();
    interceptor.intercept(get('/api/v1/transfers/scheduled', { 'X-Mol-Cache': '1' }), next).subscribe();
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '1' }), next).subscribe();
    expect(interceptor.size).toBe(3);
    interceptor.intercept(new HttpRequest('POST', '/api/v1/transfers/TRF-123/cancel', {}), next).subscribe();
    expect(interceptor.size).toBe(1);
  });

  it('drops everything on the bust header', () => {
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache': '1' }), next).subscribe();
    interceptor.intercept(get('/api/v1/accounts', { 'X-Mol-Cache-Bust': '1' }), next).subscribe();
    expect(interceptor.size).toBe(0);
  });
});
