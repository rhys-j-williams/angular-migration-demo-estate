import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Marketing slot fed by Semaphore flag mol.dashboard.promo; hidden when the flag is off. */
@Component({
  selector: 'mol-promo-banner',
  templateUrl: './promo-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoBannerComponent {}
