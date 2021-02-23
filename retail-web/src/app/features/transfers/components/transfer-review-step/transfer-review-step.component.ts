import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Account, Payee, TransferRequest } from '../../../../core/api/models';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfigService } from '../../../../core/config/config.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { TransferDraft, TransferDraftService } from '../../services/transfer-draft.service';
import { transfersActions } from '../../store/transfers.actions';

/**
 * Read-back before submit. Behind MfaStepUpGuard: by the time this renders, either the amount is
 * under the threshold or the customer has an mfa_at claim younger than ten minutes.
 */
@Component({
  selector: 'mol-transfer-review-step',
  templateUrl: './transfer-review-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferReviewStepComponent implements OnInit {
  draft!: TransferDraft;
  from?: Account;
  to?: Account;
  payee$: Observable<Payee | undefined> = of(undefined);
  busy = false;
  error: AppError | null = null;
  acknowledged = false;

  constructor(
    readonly drafts: TransferDraftService,
    private readonly api: TransfersApiService,
    private readonly accountsApi: AccountsApiService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.draft = this.drafts.value;
    if (this.draft.amountMinor === null || !this.draft.fromAccountId) {
      void this.router.navigate(['/transfers/new']);
      return;
    }
    // After a Keystone step-up the app has reloaded and the wizard's resolver data is gone.
    if (!this.drafts.accounts.length) {
      this.drafts.accounts = await lastValueFrom(this.accountsApi.list().pipe(catchError(() => of([] as Account[]))));
    }
    this.from = this.drafts.account(this.draft.fromAccountId);
    this.to = this.drafts.account(this.draft.toAccountId);
    if (this.draft.payeeId) {
      this.payee$ = this.api.payees().pipe(map(list => list.find(p => p.payeeId === this.draft.payeeId)), catchError(() => of(undefined)));
    }
    this.cdr.markForCheck();
  }

  get isHighValue(): boolean {
    return (this.draft.amountMinor ?? 0) >= this.config.value.transfers.mfaStepUpThresholdMinor;
  }

  get mfaAgeSeconds(): number | null {
    return this.auth.mfaAgeSeconds();
  }

  get needsAcknowledgement(): boolean {
    return this.draft.type === 'wire' || this.draft.type === 'external';
  }

  get feeMinor(): number {
    return this.draft.type === 'wire' ? 2500 : 0;
  }

  get isToday(): boolean {
    return this.draft.scheduledFor === new Date().toISOString().slice(0, 10);
  }

  submit(): void {
    if (this.busy || (this.needsAcknowledgement && !this.acknowledged)) return;
    this.busy = true;
    this.error = null;
    const request: TransferRequest = {
      type: this.draft.type,
      fromAccountId: this.draft.fromAccountId ?? '',
      toAccountId: this.draft.toAccountId ?? undefined,
      payeeId: this.draft.payeeId ?? undefined,
      amountMinor: this.draft.amountMinor ?? 0,
      memo: this.draft.memo || undefined,
      scheduledFor: this.draft.scheduledFor ?? new Date().toISOString().slice(0, 10),
      frequency: this.draft.frequency,
      endAfterOccurrences: this.draft.endAfterOccurrences ?? undefined,
      idempotencyKey: this.draft.idempotencyKey
    };
    this.api.submit(request).subscribe({
      next: transfer => {
        this.lantern.track('transfer.submitted', { type: transfer.type, frequency: transfer.frequency, highValue: this.isHighValue, status: transfer.status });
        this.drafts.clear();
        this.store.dispatch(transfersActions.upsert({ item: transfer }));
        void this.router.navigate(['/transfers', transfer.transferId, 'confirmation']);
      },
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.lantern.track('transfer.failed', { type: this.draft.type, code: err.code ?? 'unknown' });
        this.cdr.markForCheck();
      }
    });
  }

  edit(): void {
    void this.router.navigate(['/transfers/new']);
  }
}
