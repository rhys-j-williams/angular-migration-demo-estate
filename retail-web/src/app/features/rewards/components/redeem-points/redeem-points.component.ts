import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { RewardsApiService } from '../../../../core/api/rewards-api.service';
import { rewardsActions } from '../../store/rewards.actions';

/** Redemption form. */
@Component({
  selector: 'mol-redeem-points',
  templateUrl: './redeem-points.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedeemPointsComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      optionId: new FormControl<string | null>(null, { nonNullable: false, validators: [Validators.required] }),
      points: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(7)] })
  });
  readonly optionIdOptions: CnSelectOption<string>[] = [
    { value: 'statement-credit', label: $localize`:@@rewards.redeemPoints.optionId.statement-credit:Statement credit` },
    { value: 'deposit', label: $localize`:@@rewards.redeemPoints.optionId.deposit:Deposit to checking or savings` },
    { value: 'gift-card', label: $localize`:@@rewards.redeemPoints.optionId.gift-card:Gift card` }
  ];
  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly api: RewardsApiService,
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
    this.api.redeem(this.form.value.optionId ?? '', Number(this.form.value.points)).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@rewards.redeemPoints.saved:Redemption submitted.`);
        this.store.dispatch(rewardsActions.load());
        void this.router.navigate(['/rewards']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/rewards']);
  }
}
