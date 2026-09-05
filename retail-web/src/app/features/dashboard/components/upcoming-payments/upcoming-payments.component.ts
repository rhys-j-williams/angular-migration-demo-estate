import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Scheduled transfers and bills due in the next 14 days. */
@Component({
  selector: 'mol-upcoming-payments',
  templateUrl: './upcoming-payments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingPaymentsComponent {}
