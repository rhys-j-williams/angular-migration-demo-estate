import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Card, CardControls } from './models';

@Injectable({ providedIn: 'root' })
export class CardsApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  list(): Observable<Card[]> {
    return this.get<Card[]>('/cards', { cacheSeconds: 120 });
  }

  controls(cardId: string): Observable<CardControls> {
    return this.get<CardControls>(`/cards/${encodeURIComponent(cardId)}/controls`);
  }

  updateControls(cardId: string, controls: Partial<CardControls>): Observable<CardControls> {
    return this.http.patch<CardControls>(this.url(`/cards/${encodeURIComponent(cardId)}/controls`), controls);
  }

  lock(cardId: string, locked: boolean): Observable<Card> {
    return this.http.post<Card>(this.url(`/cards/${encodeURIComponent(cardId)}/${locked ? 'lock' : 'unlock'}`), {});
  }

  reportLostOrStolen(cardId: string, reason: 'lost' | 'stolen' | 'damaged', lastSeen?: string): Observable<Card> {
    return this.http.post<Card>(this.url(`/cards/${encodeURIComponent(cardId)}/replace`), { reason, lastSeen });
  }

  /** bff-retail only stores `until` and a single destination string today (PLAT-2277 for the from date). */
  travelNotice(cardId: string, from: string, until: string, destinations: string[]): Observable<Card> {
    return this.http.post<Card>(this.url(`/cards/${encodeURIComponent(cardId)}/travel-notice`), { from, until, destination: destinations.join(', ') });
  }

  activate(cardId: string, last4: string, expiry: string): Observable<Card> {
    return this.http.post<Card>(this.url(`/cards/${encodeURIComponent(cardId)}/activate`), { last4, expiry });
  }

  /** Full PAN for the "show card number" panel. Needs a recent MFA claim; the BFF checks. */
  reveal(cardId: string): Observable<{ cardNumber: string; cvv: string; expiresIn: number }> {
    return this.http.post<{ cardNumber: string; cvv: string; expiresIn: number }>(this.url(`/cards/${encodeURIComponent(cardId)}/reveal`), {});
  }
}
