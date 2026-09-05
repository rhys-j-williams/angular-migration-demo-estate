import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Composes the dashboard tiles; owns the greeting and the tile layout. */
@Component({
  selector: 'mol-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent {}
