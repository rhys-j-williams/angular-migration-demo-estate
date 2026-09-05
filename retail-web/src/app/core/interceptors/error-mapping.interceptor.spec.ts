import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { AuthService } from '../auth/auth.service';
import { AppError } from '../errors/app-error.model';
import { ErrorMappingInterceptor } from './error-mapping.interceptor';

describe('ErrorMappingInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: { refresh: jasmine.Spy; logout: jasmine.Spy };

  beforeEach(() => {
    auth = { refresh: jasmine.createSpy('refresh').and.resolveTo(true), logout: jasmine.createSpy('logout') };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorMappingInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function fail(status: number, body: unknown, headers: Record<string, string> = {}): Promise<AppError> {
    return new Promise(resolve => {
      http.post('/api/v1/transfers', {}).subscribe({ error: (e: AppError) => resolve(e) });
      backend.expectOne('/api/v1/transfers').flush(body, { status, statusText: 'x', headers });
    });
  }

  it('maps RFC 7807 problem details from the BFF', async () => {
    const err = await fail(422, {
      title: 'Transfer exceeds your daily limit',
      code: 'TRANSFER_LIMIT_EXCEEDED',
      detail: 'limit 10000.00',
      correlationId: 'mol-abc-1',
      errors: [{ field: 'amount', message: 'Over the daily limit' }]
    });
    expect(err.kind).toBe('validation');
    expect(err.code).toBe('TRANSFER_LIMIT_EXCEEDED');
    expect(err.title).toBe('Transfer exceeds your daily limit');
    expect(err.correlationId).toBe('mol-abc-1');
    expect(err.fieldErrors).toEqual({ amount: 'Over the daily limit' });
    expect(err.retryable).toBeFalse();
    expect(err.method).toBe('POST');
  });

  it('gives a network failure a customer facing title and marks it retryable', async () => {
    const err = await fail(0, null);
    expect(err.kind).toBe('network');
    expect(err.retryable).toBeTrue();
    expect(err.title.length).toBeGreaterThan(10);
  });

  it('classifies by status when the body is useless', async () => {
    expect((await fail(403, '')).kind).toBe('forbidden');
    expect((await fail(423, {})).kind).toBe('locked');
    expect((await fail(503, { message: 'legacy' })).kind).toBe('server');
    expect((await fail(503, {})).retryable).toBeTrue();
  });

  it('prefers the correlation id from the response header', async () => {
    const err = await fail(500, {}, { 'X-Correlation-Id': 'mol-hdr-9' });
    expect(err.correlationId).toBe('mol-hdr-9');
  });

  it('tries one silent refresh on 401 and logs out when it fails', fakeAsync(() => {
    auth.refresh.and.resolveTo(false);
    let seen: AppError | undefined;
    http.get('/api/v1/accounts').subscribe({ error: (e: AppError) => (seen = e) });
    http.get('/api/v1/cards').subscribe({ error: () => undefined });
    backend.match(() => true).forEach(r => r.flush({}, { status: 401, statusText: 'Unauthorized' }));
    flushMicrotasks();
    expect(seen?.kind).toBe('unauthenticated');
    expect(auth.refresh).toHaveBeenCalledTimes(1);
    expect(auth.logout).toHaveBeenCalledWith('server-401');
  }));
});
