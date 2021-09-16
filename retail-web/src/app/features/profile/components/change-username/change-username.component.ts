import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { profileActions } from '../../store/profile.actions';

/** Username change. Untyped form. */
@Component({
  selector: 'mol-change-username',
  templateUrl: './change-username.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeUsernameComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(30)]]
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
    this.api.changeUsername(this.form.value.username).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@profile.changeUsername.saved:Username changed. Use it next time you sign in.`);
        this.store.dispatch(profileActions.load());
        void this.router.navigate(['/profile/security']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/profile/security']);
  }
}
