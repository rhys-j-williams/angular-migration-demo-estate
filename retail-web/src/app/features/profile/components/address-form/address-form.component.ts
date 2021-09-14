import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { profileActions } from '../../store/profile.actions';

/** Address editor. Untyped form. */
@Component({
  selector: 'mol-address-form',
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group({
      line1: ['', [Validators.required, Validators.maxLength(80)]],
      line2: ['', [Validators.maxLength(80)]],
      city: ['', [Validators.required, Validators.maxLength(60)]],
      state: ['', [Validators.required, Validators.maxLength(2)]],
      postalCode: ['', [Validators.required, Validators.maxLength(10)]]
  });

  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly fb: UntypedFormBuilder, private readonly api: ProfileApiService,
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
    this.api.updateAddress({ ...this.form.value, country: 'US' }).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@profile.addressForm.saved:Address updated.`);
        this.store.dispatch(profileActions.load());
        void this.router.navigate(['/profile']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/profile']);
  }
}
