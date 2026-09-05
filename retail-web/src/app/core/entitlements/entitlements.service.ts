import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';

export interface CustomerEntitlements {
  customerId: string;
  /** Product entitlements: 'accounts' | 'transfers' | 'bill-pay' | 'cards' | 'paylink' | 'rewards' ... */
  products: string[];
  segment: 'consumer' | 'small-business' | 'treasury';
}

/**
 * Product entitlements from bff-retail (/me/entitlements), which in turn asks entitlements-service.
 * Loaded once after login by the session effects and cached for the session. Feature modules read
 * `has$`; LazyModuleGuard reads it before downloading a chunk.
 */
@Injectable({ providedIn: 'root' })
export class EntitlementsService {
  private readonly loaded$ = new ReplaySubject<CustomerEntitlements | null>(1);
  private request$: Observable<CustomerEntitlements | null> | null = null;

  constructor(private readonly http: HttpClient, private readonly config: ConfigService) {}

  load(): Observable<CustomerEntitlements | null> {
    if (!this.request$) {
      this.request$ = this.http.get<CustomerEntitlements>(`${this.config.value.apiBaseUrl}/me/entitlements`).pipe(
        catchError(() => of(null)),
        tap(e => this.loaded$.next(e)),
        shareReplay(1)
      );
    }
    return this.request$;
  }

  get entitlements$(): Observable<CustomerEntitlements | null> {
    return this.loaded$.asObservable();
  }

  has$(product: string): Observable<boolean> {
    return this.load().pipe(map(e => (e ? e.products.includes(product) : true)));
  }

  /** Test seam and logout hook. */
  reset(): void {
    this.request$ = null;
    this.loaded$.next(null);
  }
}
