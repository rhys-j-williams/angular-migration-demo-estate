import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { accountsActions } from '../../store/accounts.actions';

/** Reg E dispute intake form. */
@Component({
  selector: 'mol-dispute-transaction',
  templateUrl: './dispute-transaction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeTransactionComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      reason: new FormControl<string | null>(null, { nonNullable: false, validators: [Validators.required] }),
      detail: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(1000)] })
  });
  readonly reasonOptions: CnSelectOption<string>[] = [
    { value: 'unauthorised', label: $localize`:@@accounts.disputeTransaction.reason.unauthorised:I did not make this purchase` },
    { value: 'duplicate', label: $localize`:@@accounts.disputeTransaction.reason.duplicate:I was charged twice` },
    { value: 'amount', label: $localize`:@@accounts.disputeTransaction.reason.amount:The amount is wrong` },
    { value: 'not-received', label: $localize`:@@accounts.disputeTransaction.reason.not-received:I did not receive what I paid for` }
  ];
  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly api: AccountsApiService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving;
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    this.error = null;
    this.api.openDispute(this.router.url.split('/')[2], this.router.url.split('/')[4], this.form.value.reason ?? '', this.form.value.detail ?? '').subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@accounts.disputeTransaction.saved:Dispute submitted. We will email you a reference within 24 hours.`);
        this.store.dispatch(accountsActions.load());
        void this.router.navigate(['/accounts']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/accounts']);
  }
}
