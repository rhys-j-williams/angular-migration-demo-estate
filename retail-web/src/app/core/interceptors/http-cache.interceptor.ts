import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

/**
 * Five minute in-memory cache for GET responses that opt in with `X-Mol-Cache: <ttl seconds>` (or
 * just `X-Mol-Cache: 1` for the default). Also de-duplicates in-flight requests for the same URL,
 * which is what actually fixed the "dashboard fires the accounts call six times" ticket (MOL-2760):
 * six tiles, six selectors, one HTTP call.
 *
 * Cache is per tab and dies with it. Any non-GET to a URL invalidates every cached entry whose URL
 * starts with the same path prefix, so a transfer POST to /transfers drops /transfers and
 * /transfers/scheduled, and an explicit `X-Mol-Cache-Bust` header drops everything (logout, the
 * pull-to-refresh on the dashboard).
 *
 * Do not put customer PII into the cache key; the URL is the key and the BFF paths use opaque ids.
 */
@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
  static readonly CACHE_HEADER = 'X-Mol-Cache';
  static readonly BUST_HEADER = 'X-Mol-Cache-Bust';
  static readonly DEFAULT_TTL_SECONDS = 300;

  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Observable<HttpEvent<unknown>>>();

  /** Overridden in the spec to control time. */
  protected now(): number {
    return Date.now();
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.headers.has(HttpCacheInterceptor.BUST_HEADER)) {
      this.clear();
      req = req.clone({ headers: req.headers.delete(HttpCacheInterceptor.BUST_HEADER) });
    }

    if (req.method !== 'GET') {
      this.invalidatePrefix(req.url);
      return next.handle(req);
    }

    const ttlHeader = req.headers.get(HttpCacheInterceptor.CACHE_HEADER);
    if (ttlHeader === null) {
      return next.handle(req);
    }
    const ttlSeconds = Number(ttlHeader) > 1 ? Number(ttlHeader) : HttpCacheInterceptor.DEFAULT_TTL_SECONDS;
    const key = req.urlWithParams;
    const cleaned = req.clone({ headers: req.headers.delete(HttpCacheInterceptor.CACHE_HEADER) });

    const hit = this.cache.get(key);
    if (hit && hit.expiresAt > this.now()) {
      return of(hit.response.clone());
    }
    if (hit) {
      this.cache.delete(key);
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      return pending;
    }

    const request$ = next.handle(cleaned).pipe(
      tap({
        next: event => {
          if (event instanceof HttpResponse && event.ok) {
            this.cache.set(key, { response: event.clone(), expiresAt: this.now() + ttlSeconds * 1000 });
          }
        },
        finalize: () => this.inFlight.delete(key)
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inFlight.set(key, request$);
    return request$;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  /**
   * /api/v1/transfers/TRF-123/cancel -> /api/v1/transfers ; /api/v1/payees -> /api/v1/payees.
   * Everything from the first id-looking segment onwards is dropped so the collection and every
   * sibling detail entry go together.
   */
  private invalidatePrefix(url: string): void {
    const segments = url.split('?')[0].split('/');
    const firstId = segments.findIndex((s, i) => i > 0 && /[A-Z0-9]/.test(s) && !/^v\d+$/.test(s) && !/^[a-z-]+$/.test(s));
    const prefix = (firstId === -1 ? segments : segments.slice(0, firstId)).join('/');
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}
