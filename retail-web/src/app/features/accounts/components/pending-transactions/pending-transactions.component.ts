import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Transaction } from '../../../../core/api/models';

/** Pending card authorisations shown above posted transactions. Collapsed by default past three. */
@Component({
  selector: 'mol-pending-transactions',
  templateUrl: './pending-transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingTransactionsComponent implements OnChanges {
  @Input() accountId!: string;
  pending$: Observable<Transaction[]> = of([]);
  showAll = false;

  constructor(private readonly api: AccountsApiService) {}

  ngOnChanges(): void {
    this.showAll = false;
    this.pending$ = this.api.transactions({ accountId: this.accountId, status: 'pending', page: 1, pageSize: 50 }).pipe(
      map(p => p.items),
      catchError(() => of([] as Transaction[]))
    );
  }

  visible(rows: Transaction[]): Transaction[] {
    return this.showAll ? rows : rows.slice(0, 3);
  }

  total(rows: Transaction[]): number {
    return rows.reduce((sum, t) => sum + t.amountMinor, 0);
  }
}
