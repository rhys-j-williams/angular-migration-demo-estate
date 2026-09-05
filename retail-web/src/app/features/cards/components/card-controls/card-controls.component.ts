import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CnFilterChip } from '@meridian/canopy-ui/data-display';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { CardsApiService } from '../../../../core/api/cards-api.service';
import { CardControls } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';

interface ControlsForm {
  internationalEnabled: FormControl<boolean>;
  onlineEnabled: FormControl<boolean>;
  atmEnabled: FormControl<boolean>;
  contactlessEnabled: FormControl<boolean>;
  limitEnabled: FormControl<boolean>;
  dailySpendLimit: FormControl<number | null>;
  blockedMerchantCategories: FormControl<string[]>;
}

/** Merchant category groups the card network lets us block. Codes are the ISO 18245 ranges. */
export const MERCHANT_CATEGORIES: CnFilterChip[] = [
  { value: 'gambling', label: 'Gambling', icon: 'casino' },
  { value: 'adult', label: 'Adult content', icon: 'block' },
  { value: 'alcohol', label: 'Liquor stores', icon: 'liquor' },
  { value: 'crypto', label: 'Crypto exchanges', icon: 'currency_bitcoin' },
  { value: 'money-transfer', label: 'Money transfer services', icon: 'swap_horiz' },
  { value: 'subscriptions', label: 'Recurring subscriptions', icon: 'autorenew' }
];

/** Per-card spend controls. */
@Component({
  selector: 'mol-card-controls',
  templateUrl: './card-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardControlsComponent implements OnInit {
  readonly cardId = this.route.snapshot.paramMap.get('cardId') ?? '';
  readonly categories = MERCHANT_CATEGORIES;
  readonly form: FormGroup<ControlsForm> = this.fb.group({
    internationalEnabled: this.fb.control(true),
    onlineEnabled: this.fb.control(true),
    atmEnabled: this.fb.control(true),
    contactlessEnabled: this.fb.control(true),
    limitEnabled: this.fb.control(false),
    dailySpendLimit: this.fb.control<number | null>(null, [Validators.min(20), Validators.max(10000)]),
    blockedMerchantCategories: this.fb.control<string[]>([])
  });
  loading = true;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: NonNullableFormBuilder,
    private readonly api: CardsApiService,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const c = await this.api.controls(this.cardId).toPromise();
      if (c) this.apply(c);
    } catch (err) {
      this.error = err as AppError;
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private apply(c: CardControls): void {
    this.form.reset({
      internationalEnabled: c.internationalEnabled,
      onlineEnabled: c.onlineEnabled,
      atmEnabled: c.atmEnabled,
      contactlessEnabled: c.contactlessEnabled,
      limitEnabled: c.dailySpendLimitMinor !== null,
      dailySpendLimit: c.dailySpendLimitMinor === null ? null : c.dailySpendLimitMinor / 100,
      blockedMerchantCategories: c.blockedMerchantCategories
    });
  }

  get allOff(): boolean {
    const v = this.form.getRawValue();
    return !v.internationalEnabled && !v.onlineEnabled && !v.atmEnabled && !v.contactlessEnabled;
  }

  toPayload(): Partial<CardControls> {
    const v = this.form.getRawValue();
    return {
      internationalEnabled: v.internationalEnabled,
      onlineEnabled: v.onlineEnabled,
      atmEnabled: v.atmEnabled,
      contactlessEnabled: v.contactlessEnabled,
      dailySpendLimitMinor: v.limitEnabled && v.dailySpendLimit !== null ? Math.round(v.dailySpendLimit * 100) : null,
      blockedMerchantCategories: v.blockedMerchantCategories
    };
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = null;
    try {
      const saved = await this.api.updateControls(this.cardId, this.toPayload()).toPromise();
      if (saved) this.apply(saved);
      this.lantern.track('cards.controls.saved', { blocked: this.form.controls.blockedMerchantCategories.value.length, limit: this.form.controls.limitEnabled.value });
      this.toast.success($localize`:@@cards.controls.saved:Card controls saved. Changes apply to the next purchase.`);
    } catch (err) {
      this.error = err as AppError;
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }
}
