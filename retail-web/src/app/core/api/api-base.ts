import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { HttpCacheInterceptor } from '../interceptors/http-cache.interceptor';

/**
 * Thin base for the per-domain API services. Not an abstraction over HttpClient, just the three
 * things every service was repeating: the base URL from runtime config, the cache opt-in header
 * and dropping undefined query params (HttpParams stringifies them to "undefined" and the BFF
 * 400s, MOL-2119).
 */
export abstract class ApiBase {
  protected constructor(protected readonly http: HttpClient, protected readonly config: ConfigService) {}

  protected url(path: string): string {
    return `${this.config.value.apiBaseUrl}${path}`;
  }

  protected cached(ttlSeconds: number = HttpCacheInterceptor.DEFAULT_TTL_SECONDS): HttpHeaders {
    return new HttpHeaders({ [HttpCacheInterceptor.CACHE_HEADER]: String(ttlSeconds) });
  }

  protected params(input: object): HttpParams {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(input) as [string, unknown][]) {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    }
    return params;
  }

  protected get<T>(path: string, options: { params?: HttpParams; cacheSeconds?: number } = {}): Observable<T> {
    return this.http.get<T>(this.url(path), {
      params: options.params,
      headers: options.cacheSeconds ? this.cached(options.cacheSeconds) : undefined
    });
  }
}
