import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Date range, category, amount and search filters for the transaction list. */
@Component({
  selector: 'mol-transaction-filters',
  templateUrl: './transaction-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFiltersComponent {}
