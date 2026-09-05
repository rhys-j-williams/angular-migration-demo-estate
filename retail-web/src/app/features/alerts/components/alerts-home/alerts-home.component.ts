import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Tabs: preferences and history. */
@Component({
  selector: 'mol-alerts-home',
  templateUrl: './alerts-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsHomeComponent {}
