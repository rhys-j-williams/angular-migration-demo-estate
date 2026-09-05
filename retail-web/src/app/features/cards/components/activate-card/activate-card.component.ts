import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { CardsApiService } from '../../../../core/api/cards-api.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { cardsActions } from '../../store/cards.actions';

interface ActivateForm {
  last4: FormControl<string>;
  expiry: FormControl<string>;
}

/** New card activation: last four and expiry off the physical card, nothing else. */
@Component({
  selector: 'mol-activate-card',
  templateUrl: './activate-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivateCardComponent {
  readonly cardId = this.route.snapshot.paramMap.get('cardId') ?? '';
  readonly form: FormGroup<ActivateForm> = this.fb.group({
    last4: this.fb.control('', [Validators.required, Validators.pattern(/^\d{4}$/)]),
    expiry: this.fb.control('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)])
  });
  busy = false;
  error: AppError | null = null;
  attempts = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: NonNullableFormBuilder,
    private readonly api: CardsApiService,
    private readonly store: Store,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get lockedOut(): boolean {
    return this.attempts >= 3;
  }

  submit(): void {
    if (this.form.invalid || this.busy || this.lockedOut) {
      this.form.markAllAsTouched();
      return;
    }
    const { last4, expiry } = this.form.getRawValue();
    this.busy = true;
    this.error = null;
    this.api.activate(this.cardId, last4, expiry).subscribe({
      next: card => {
        this.store.dispatch(cardsActions.upsert({ item: card }));
        this.lantern.track('cards.activated', { attempts: this.attempts + 1 });
        this.toast.success($localize`:@@cards.activate.done:Your card is active. Destroy the old one.`);
        void this.router.navigate(['/cards', card.cardId]);
      },
      error: (err: AppError) => {
        this.busy = false;
        this.attempts += 1;
        this.error = err;
        if (this.lockedOut) this.lantern.track('cards.activation.locked_out');
        this.cdr.markForCheck();
      }
    });
  }
}
