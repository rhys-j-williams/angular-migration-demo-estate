import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { transfersActions } from '../../store/transfers.actions';

/** External account (ACH) payee entry. Always requires MFA step-up. */
@Component({
  selector: 'mol-add-payee',
  templateUrl: './add-payee.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPayeeComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      nickname: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }),
      name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
      routingNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      accountNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      accountType: new FormControl<string | null>(null, { nonNullable: false, validators: [Validators.required] })
  });
  readonly accountTypeOptions: CnSelectOption<string>[] = [
    { value: 'checking', label: $localize`:@@transfers.addPayee.accountType.checking:Checking` },
    { value: 'savings', label: $localize`:@@transfers.addPayee.accountType.savings:Savings` }
  ];
  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly api: TransfersApiService,
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
    this.api.addPayee({ name: this.form.value.name ?? '', nickname: this.form.value.nickname ?? '', routingNumber: this.form.value.routingNumber ?? '', accountNumber: this.form.value.accountNumber ?? '', accountNumberLastFour: (this.form.value.accountNumber ?? '').slice(-4), type: 'external-transfer' }).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@transfers.addPayee.saved:Account added. Watch for two small deposits to verify it.`);
        this.store.dispatch(transfersActions.load());
        void this.router.navigate(['/transfers/payees']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/transfers/payees']);
  }
}
