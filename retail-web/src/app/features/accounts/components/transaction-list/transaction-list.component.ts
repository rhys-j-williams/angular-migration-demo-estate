import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Filterable, paged transaction list for one account. Used inside account detail. */
@Component({
  selector: 'mol-transaction-list',
  templateUrl: './transaction-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionListComponent {}
