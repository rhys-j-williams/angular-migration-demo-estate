import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Reveals routing and full account number for direct deposit forms. */
@Component({
  selector: 'mol-routing-details',
  templateUrl: './routing-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutingDetailsComponent {}
