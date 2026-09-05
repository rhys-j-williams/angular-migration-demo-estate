import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Messages in a thread with reply box. */
@Component({
  selector: 'mol-thread-view',
  templateUrl: './thread-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadViewComponent {}
