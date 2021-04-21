import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { BillPayApiService } from '../../../../core/api/bill-pay-api.service';
import { billPayActions } from '../../store/bill-pay.actions';

/** Bill pay payee entry (directory or manual). */
@Component({
  selector: 'mol-add-bill-payee',
  templateUrl: './add-bill-payee.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddBillPayeeComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
      accountNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(32)] }),
      nickname: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(40)] }),
      postalCode: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(10)] })
  });

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
    this.api.enrollEbill(this.form.value.accountNumber ?? '').subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@billPay.addBillPayee.saved:Payee added.`);
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
