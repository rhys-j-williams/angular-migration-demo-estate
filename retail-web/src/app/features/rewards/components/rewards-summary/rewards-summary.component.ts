import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Points balance, tier and expiring points. */
@Component({
  selector: 'mol-rewards-summary',
  templateUrl: './rewards-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsSummaryComponent {}
