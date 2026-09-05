import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectDismissedBanners, sessionActions } from '../../../../core/store/session';
import { LanternService } from '../../../../core/telemetry/lantern.service';

/** Marketing slot fed by Semaphore flag mol.dashboard.promo; hidden when the flag is off. */
@Component({
  selector: 'mol-promo-banner',
  templateUrl: './promo-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoBannerComponent {
  /** Copy is owned by Marketing Ops; the id changes per campaign so dismissals do not carry over. */
  readonly bannerId = 'promo-reserve-savings-2026q3';
  readonly dismissed$ = this.store.select(selectDismissedBanners);
  @Output() readonly dismissed = new EventEmitter<void>();

  constructor(private readonly store: Store, private readonly lantern: LanternService) {}

  dismiss(): void {
    this.store.dispatch(sessionActions.bannerDismissed({ bannerId: this.bannerId }));
    this.lantern.track('dashboard.promo.dismissed', { bannerId: this.bannerId });
    this.dismissed.emit();
  }

  learnMore(): void {
    this.lantern.track('dashboard.promo.clicked', { bannerId: this.bannerId });
  }
}
