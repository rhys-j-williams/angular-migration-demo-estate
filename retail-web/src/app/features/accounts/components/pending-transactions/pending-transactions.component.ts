import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Pending card authorisations shown above posted transactions. */
@Component({
  selector: 'mol-pending-transactions',
  templateUrl: './pending-transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingTransactionsComponent {}
