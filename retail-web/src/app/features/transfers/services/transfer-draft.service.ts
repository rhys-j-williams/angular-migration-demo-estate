import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Account, TransferFrequency, TransferLimits, TransferType } from '../../../core/api/models';
import { PENDING_AMOUNT_SOURCE_KEY } from '../../../core/guards/mfa-step-up.guard';

export interface TransferDraft {
  type: TransferType;
  fromAccountId: string | null;
  toAccountId: string | null;
  payeeId: string | null;
  amountMinor: number | null;
  memo: string;
  scheduledFor: string | null;
  frequency: TransferFrequency;
  endAfterOccurrences: number | null;
  /** Generated once per draft so a retry after a network blip does not double-send (MOL-3305). */
  idempotencyKey: string;
}

const DRAFT_KEY = 'mol.transfers.draft';

/**
 * Holds the in-progress transfer across the wizard steps and the review route. Persisted to
 * sessionStorage (not the store) because the MFA step-up round trip through Keystone reloads the
 * app; see MfaStepUpGuard. Cleared on submit, cancel and logout.
 */
@Injectable({ providedIn: 'root' })
export class TransferDraftService {
  private readonly draft$ = new BehaviorSubject<TransferDraft>(this.restore());
  accounts: Account[] = [];
  limits: TransferLimits | null = null;

  get value(): TransferDraft {
    return this.draft$.value;
  }

  get changes(): Observable<TransferDraft> {
    return this.draft$.asObservable();
  }

  get dirty(): boolean {
    const d = this.value;
    return d.fromAccountId !== null || d.toAccountId !== null || d.payeeId !== null || d.amountMinor !== null || d.memo !== '';
  }

  patch(change: Partial<TransferDraft>): void {
    const next = { ...this.value, ...change };
    this.draft$.next(next);
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    if (next.amountMinor === null) {
      sessionStorage.removeItem(PENDING_AMOUNT_SOURCE_KEY);
    } else {
      sessionStorage.setItem(PENDING_AMOUNT_SOURCE_KEY, String(next.amountMinor));
    }
  }

  clear(): void {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(PENDING_AMOUNT_SOURCE_KEY);
    this.draft$.next(TransferDraftService.empty());
  }

  account(id: string | null): Account | undefined {
    return id ? this.accounts.find(a => a.accountId === id) : undefined;
  }

  static empty(): TransferDraft {
    return {
      type: 'internal', fromAccountId: null, toAccountId: null, payeeId: null, amountMinor: null, memo: '',
      scheduledFor: null, frequency: 'once', endAfterOccurrences: null, idempotencyKey: crypto.randomUUID()
    };
  }

  private restore(): TransferDraft {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return TransferDraftService.empty();
    try {
      return { ...TransferDraftService.empty(), ...(JSON.parse(raw) as Partial<TransferDraft>) };
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
      return TransferDraftService.empty();
    }
  }
}
