import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { CardsApiService } from '../../../../core/api/cards-api.service';
import { cardsActions } from '../../store/cards.actions';

/** Lost/stolen intake. */
@Component({
  selector: 'mol-report-card',
  templateUrl: './report-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportCardComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      reason: new FormControl<string | null>(null, { nonNullable: false, validators: [Validators.required] }),
      lastSeen: new FormControl<string>('', { nonNullable: true })
  });
  readonly reasonOptions: CnSelectOption<string>[] = [
    { value: 'lost', label: $localize`:@@cards.reportCard.reason.lost:Lost` },
    { value: 'stolen', label: $localize`:@@cards.reportCard.reason.stolen:Stolen` },
    { value: 'damaged', label: $localize`:@@cards.reportCard.reason.damaged:Damaged` }
  ];
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
    this.api.reportLostOrStolen(this.router.url.split('/')[2], (this.form.value.reason as 'lost' | 'stolen' | 'damaged') ?? 'lost', this.form.value.lastSeen ?? undefined).subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@cards.reportCard.saved:Card cancelled. Your replacement is on its way.`);
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
