import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Alerts sent in the last 90 days. */
@Component({
  selector: 'mol-alert-history',
  templateUrl: './alert-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertHistoryComponent {}
