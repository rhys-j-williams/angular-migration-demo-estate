import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnListItem } from '@meridian/canopy-ui/data-display';

import { Account } from '../../../../core/api/models';
import { dashboardActions } from '../../store/dashboard.actions';
import { dashboardSelectors } from '../../store/dashboard.selectors';

/** Compact account list with balances for the dashboard. */
@Component({
  selector: 'mol-accounts-summary',
  templateUrl: './accounts-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsSummaryComponent implements OnInit {
  @Input() limit = 4;
  @Input() link: string | null = '/accounts';

  readonly loading$ = this.store.select(dashboardSelectors.selectLoading);
  readonly items$: Observable<CnListItem<Account>[]> = this.store
    .select(dashboardSelectors.selectAll)
    .pipe(map(rows => rows.slice(0, this.limit).map(r => this.toItem(r))));

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(dashboardActions.load());
  }

  open(item: CnListItem<Account>): void {
    if (this.link) {
      void this.router.navigate([this.link, item.id]);
    }
  }

  private toItem(r: Account): CnListItem<Account> {
    return { id: r.accountId, primary: r.nickname, secondary: `****${r.accountNumber.slice(-4)}`, meta: `$${(r.availableBalanceMinor / 100).toFixed(2)}`, data: r };
  }
}
