import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Landing: new transfer entry points, scheduled list and recent history tabs. */
@Component({
  selector: 'mol-transfers-home',
  templateUrl: './transfers-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransfersHomeComponent {}
