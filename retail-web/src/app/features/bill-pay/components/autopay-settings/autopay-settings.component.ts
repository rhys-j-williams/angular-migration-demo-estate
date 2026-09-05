import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { BillPayApiService } from '../../../../core/api/bill-pay-api.service';
import { billPayActions } from '../../store/bill-pay.actions';

/** Autopay toggle and funding account. */
@Component({
  selector: 'mol-autopay-settings',
  templateUrl: './autopay-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutopaySettingsComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      enabled: new FormControl<boolean>(false, { nonNullable: true }),
      fromAccountId: new FormControl<string | null>(null, { nonNullable: false })
  });
  readonly fromAccountIdOptions: CnSelectOption<string>[] = [
    { value: 'primary', label: $localize`:@@billPay.autopaySettings.fromAccountId.primary:Primary checking` }
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
    this.api.setAutopay(this.router.url.split('/')[3], !!this.form.value.enabled, this.form.value.fromAccountId ?? undefined).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@billPay.autopaySettings.saved:Autopay updated.`);
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
