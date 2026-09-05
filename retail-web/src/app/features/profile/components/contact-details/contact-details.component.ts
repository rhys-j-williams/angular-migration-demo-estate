import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { profileActions } from '../../store/profile.actions';

/** Email, mobile, language and paperless. Untyped form. */
@Component({
  selector: 'mol-contact-details',
  templateUrl: './contact-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactDetailsComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group({
      email: ['', [Validators.required, Validators.maxLength(120)]],
      mobile: ['', [Validators.required]],
      preferredLanguage: [null],
      paperless: [false]
  });
  readonly preferredLanguageOptions: CnSelectOption<string>[] = [
    { value: 'en', label: $localize`:@@profile.contactDetails.preferredLanguage.en:English` },
    { value: 'es', label: $localize`:@@profile.contactDetails.preferredLanguage.es:Español` }
  ];
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
    this.api.updateContact(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@profile.contactDetails.saved:Contact details updated.`);
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
