import { ChangeDetectionStrategy, Component } from '@angular/core';

/** One alert: toggle, channels, threshold. */
@Component({
  selector: 'mol-alert-preference-row',
  templateUrl: './alert-preference-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPreferenceRowComponent {}
