import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Do-not-disturb window for non-regulatory alerts. */
@Component({
  selector: 'mol-quiet-hours',
  templateUrl: './quiet-hours.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuietHoursComponent {}
