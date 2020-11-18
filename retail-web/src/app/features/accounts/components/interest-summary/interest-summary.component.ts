import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Year-to-date interest earned or charged, from the account details. */
@Component({
  selector: 'mol-interest-summary',
  templateUrl: './interest-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestSummaryComponent {}
