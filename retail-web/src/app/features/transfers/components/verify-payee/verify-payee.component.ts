import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { transfersActions } from '../../store/transfers.actions';

/** Micro-deposit verification. */
@Component({
  selector: 'mol-verify-payee',
  templateUrl: './verify-payee.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyPayeeComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      first: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required, Validators.min(1)] }),
      second: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required, Validators.min(1)] })
  });

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
    this.api.verifyPayee(this.router.url.split('/')[3], [this.form.value.first ?? 0, this.form.value.second ?? 0] as [number, number]).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@transfers.verifyPayee.saved:Account verified. You can transfer to it now.`);
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
