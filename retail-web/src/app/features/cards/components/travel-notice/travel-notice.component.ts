import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { CardsApiService } from '../../../../core/api/cards-api.service';
import { cardsActions } from '../../store/cards.actions';

/** Travel notice entry. */
@Component({
  selector: 'mol-travel-notice',
  templateUrl: './travel-notice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelNoticeComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      from: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      until: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      destinations: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] })
  });

  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly api: CardsApiService,
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
    this.api.travelNotice(this.router.url.split('/')[2], this.form.value.from ?? '', this.form.value.until ?? '', (this.form.value.destinations ?? '').split(',').map(s => s.trim()).filter(Boolean)).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@cards.travelNotice.saved:Travel notice saved. Have a good trip.`);
        this.store.dispatch(cardsActions.load());
        void this.router.navigate(['/cards']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/cards']);
  }
}
