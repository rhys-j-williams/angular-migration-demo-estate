import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ContentApiService } from '../../../../core/api/content-api.service';

/** Product and options. Untyped form. */
@Component({
  selector: 'mol-product-step',
  templateUrl: './product-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductStepComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group({
      productCode: [null, [Validators.required]],
      debitCard: [false],
      paperless: [false]
  });
  readonly productCodeOptions: CnSelectOption<string>[] = [
    { value: 'CHK-EVERYDAY', label: $localize`:@@onboarding.productStep.productCode.CHK-EVERYDAY:Everyday Checking - no monthly fee with direct deposit` },
    { value: 'SAV-RESERVE', label: $localize`:@@onboarding.productStep.productCode.SAV-RESERVE:Reserve Savings - 4.10% APY` },
    { value: 'CHK-PREMIER', label: $localize`:@@onboarding.productStep.productCode.CHK-PREMIER:Premier Checking - interest bearing, $25 monthly fee waivable` }
  ];
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
    this.api.saveApplicationStep(sessionStorage.getItem('mol.onboarding.appId') ?? '', 'product', this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@onboarding.productStep.saved:Saved`);
        void this.router.navigate(['/open-account/funding']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/open-account/funding']);
  }
}
