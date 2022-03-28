import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ContentApiService } from '../../../../core/api/content-api.service';

/** Email, mobile and address. Untyped form. */
@Component({
  selector: 'mol-contact-step',
  templateUrl: './contact-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactStepComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group({
      email: ['', [Validators.required, Validators.maxLength(120)]],
      mobile: ['', [Validators.required]],
      line1: ['', [Validators.required, Validators.maxLength(80)]],
      city: ['', [Validators.required, Validators.maxLength(60)]],
      state: ['', [Validators.required, Validators.maxLength(2)]],
      postalCode: ['', [Validators.required, Validators.maxLength(10)]]
  });

  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly fb: UntypedFormBuilder, private readonly api: ContentApiService,
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
    this.api.saveApplicationStep(sessionStorage.getItem('mol.onboarding.appId') ?? '', 'contact', this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@onboarding.contactStep.saved:Saved`);
        void this.router.navigate(['/open-account/product']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/open-account/product']);
  }
}
