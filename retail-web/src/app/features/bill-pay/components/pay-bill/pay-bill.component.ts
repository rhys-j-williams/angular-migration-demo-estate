import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { BillPayApiService } from '../../../../core/api/bill-pay-api.service';
import { billPayActions } from '../../store/bill-pay.actions';

/** Schedule a single payment. Typed form; behind MfaStepUpGuard for high amounts. */
@Component({
  selector: 'mol-pay-bill',
  templateUrl: './pay-bill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayBillComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      fromAccountId: new FormControl<string | null>(null, { nonNullable: false, validators: [Validators.required] }),
      amountMinor: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required, Validators.min(1)] }),
      sendOn: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      memo: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(60)] })
  });
  readonly fromAccountIdOptions: CnSelectOption<string>[] = [
    { value: 'primary', label: $localize`:@@billPay.payBill.fromAccountId.primary:Primary checking` }
  ];
  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly api: BillPayApiService,
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
    this.api.schedule({ payeeId: this.router.url.split('/')[3], fromAccountId: this.form.value.fromAccountId ?? '', amountMinor: this.form.value.amountMinor ?? 0, sendOn: this.form.value.sendOn ?? this.today, memo: this.form.value.memo ?? undefined, idempotencyKey: crypto.randomUUID() }).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@billPay.payBill.saved:Payment scheduled.`);
        this.store.dispatch(billPayActions.load());
        void this.router.navigate(['/bill-pay']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/bill-pay']);
  }
}
