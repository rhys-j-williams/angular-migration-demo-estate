import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Last ten transactions across all accounts. */
@Component({
  selector: 'mol-recent-activity',
  templateUrl: './recent-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentActivityComponent {}
