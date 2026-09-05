import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MfaChannel } from './idp-client.service';

export interface MfaTransaction {
  /** IdP transaction id; opaque, short lived, single use. */
  txn: string;
  username: string;
  channel: MfaChannel;
  maskedDestination?: string;
  attemptsRemaining: number;
  startedAt: number;
  /** Where the customer came from; forwarded to the IdP as state on completion. */
  returnTo: string | null;
}

const MAX_ATTEMPTS = 5;
const TXN_TTL_MS = 10 * 60 * 1000;

/**
 * In-memory state for the current login attempt. Deliberately not persisted anywhere: a refresh
 * mid-MFA sends you back to the credential form, which is the behaviour Fraud asked for (FRD-0332)
 * and which the "remember me" folk keep raising tickets against. Do not move this to
 * sessionStorage; the txn id in there was finding 4 of GIS-1490.
 */
@Injectable({ providedIn: 'root' })
export class MfaTransactionService {
  private readonly txn$ = new BehaviorSubject<MfaTransaction | null>(null);

  get current(): Observable<MfaTransaction | null> {
    return this.txn$.asObservable();
  }

  get snapshot(): MfaTransaction | null {
    const t = this.txn$.value;
    if (t && Date.now() - t.startedAt > TXN_TTL_MS) {
      this.txn$.next(null);
      return null;
    }
    return t;
  }

  get attemptsRemaining(): Observable<number> {
    return this.txn$.pipe(map((t) => t?.attemptsRemaining ?? 0));
  }

  begin(txn: string, username: string, maskedDestination: string | undefined, returnTo: string | null): void {
    this.txn$.next({
      txn,
      username,
      channel: 'sms',
      maskedDestination,
      attemptsRemaining: MAX_ATTEMPTS,
      startedAt: Date.now(),
      returnTo,
    });
  }

  get isExpired(): boolean {
    const t = this.txn$.value;
    return !!t && Date.now() - t.startedAt > TXN_TTL_MS;
  }

  switchChannel(channel: MfaChannel, maskedDestination?: string): void {
    const t = this.snapshot;
    if (t) {
      this.txn$.next({ ...t, channel, maskedDestination: maskedDestination ?? t.maskedDestination });
    }
  }

  /** Returns remaining attempts after recording a failure; 0 means the txn is spent. */
  recordFailure(): number {
    const t = this.snapshot;
    if (!t) {
      return 0;
    }
    const remaining = Math.max(0, t.attemptsRemaining - 1);
    this.txn$.next(remaining === 0 ? null : { ...t, attemptsRemaining: remaining });
    return remaining;
  }

  complete(): void {
    this.txn$.next(null);
  }

  abandon(): void {
    this.txn$.next(null);
  }
}
