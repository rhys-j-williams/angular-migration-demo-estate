import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface CnContentFragment {
  key: string;
  /** Rendered HTML authored in the CMS. */
  html: string;
  version: string;
  effectiveFrom?: string;
}

/** Base URL of the content service. Defaults to the mock-external CMS in local dev. */
export const CN_CONTENT_BASE_URL = new InjectionToken<string>('CN_CONTENT_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:4910/content/v1'
});

/**
 * Reads legal and disclosure fragments from the content platform (the CMS team's service). Results
 * are cached per key for the lifetime of the app; disclosures do not change mid-session.
 */
@Injectable({ providedIn: 'root' })
export class CnContentService {
  private readonly cache = new Map<string, Observable<CnContentFragment>>();

  constructor(@Optional() private readonly http: HttpClient | null, @Inject(CN_CONTENT_BASE_URL) private readonly baseUrl: string) {}

  fragment(key: string): Observable<CnContentFragment> {
    let cached = this.cache.get(key);
    if (!cached) {
      cached = this.load(key).pipe(shareReplay(1));
      this.cache.set(key, cached);
    }
    return cached;
  }

  private load(key: string): Observable<CnContentFragment> {
    if (!this.http) {
      return of({ key, html: '', version: 'offline' });
    }
    return this.http
      .get<CnContentFragment>(`${this.baseUrl}/fragments/${encodeURIComponent(key)}`)
      .pipe(map(f => ({ ...f, key })));
  }
}
