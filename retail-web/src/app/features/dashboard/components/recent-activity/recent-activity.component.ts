import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Account, Transaction } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { dashboardSelectors } from '../../store/dashboard.selectors';

interface ActivityRow {
  transaction: Transaction;
  account: Account;
}

/**
 * Last ten transactions across all accounts. The BFF has no cross-account endpoint (PLAT-2210 has
 * been open since 2022) so we fan out one page per deposit account and merge client side. Kept
 * to deposit accounts on purpose: credit card activity on the dashboard confused people (MOL-2919).
 */
@Component({
  selector: 'mol-recent-activity',
  templateUrl: './recent-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentActivityComponent implements OnInit {
  rows$!: Observable<ActivityRow[] | null>;
  error: AppError | null = null;

  constructor(private readonly store: Store, private readonly api: AccountsApiService) {}

  ngOnInit(): void {
    this.rows$ = this.store.select(dashboardSelectors.selectLoadedAt).pipe(
      filter((at): at is number => at !== null),
      take(1),
      switchMap(() => this.store.select(dashboardSelectors.selectAll).pipe(take(1))),
      switchMap(accounts => {
        const deposit = accounts.filter(a => a.type === 'checking' || a.type === 'savings').slice(0, 4);
        if (!deposit.length) return of([]);
        return combineLatest(
          deposit.map(a =>
            this.api.transactions({ accountId: a.accountId, page: 1, pageSize: 5 }).pipe(
              map(page => page.items.map(transaction => ({ transaction, account: a }))),
              catchError(() => of([] as ActivityRow[]))
            )
          )
        ).pipe(
          map(groups => groups.flat().sort((x, y) => y.transaction.postedAt.localeCompare(x.transaction.postedAt)).slice(0, 10))
        );
      })
    );
  }

  trackByTxn(_: number, row: ActivityRow): string {
    return row.transaction.transactionId;
  }
}
