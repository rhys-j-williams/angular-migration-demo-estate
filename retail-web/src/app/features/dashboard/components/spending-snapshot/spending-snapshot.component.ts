import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Doughnut chart of spend by category for the current month. */
@Component({
  selector: 'mol-spending-snapshot',
  templateUrl: './spending-snapshot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingSnapshotComponent {}
