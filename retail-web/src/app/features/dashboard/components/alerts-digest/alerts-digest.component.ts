import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Unread alerts since last sign-in. */
@Component({
  selector: 'mol-alerts-digest',
  templateUrl: './alerts-digest.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsDigestComponent {}
