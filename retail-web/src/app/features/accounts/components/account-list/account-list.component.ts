import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { Account } from '../../../../core/api/models';
import { accountsActions } from '../../store/accounts.actions';
import { accountsSelectors } from '../../store/accounts.selectors';

/** All accounts grouped by type with current and available balances. */
@Component({
  selector: 'mol-account-list',
  templateUrl: './account-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountListComponent implements OnInit {
  readonly rows$ = this.store.select(accountsSelectors.selectAll);
  readonly loading$ = this.store.select(accountsSelectors.selectLoading);
  readonly error$ = this.store.select(accountsSelectors.selectError);

  readonly columns: CnColumn<Account>[] = [
    { key: 'nickname', header: $localize`:@@accounts.accountList.col.nickname:Account` },
    { key: 'type', header: $localize`:@@accounts.accountList.col.type:Type` },
    { key: 'availableBalanceMinor', header: $localize`:@@accounts.accountList.col.availableBalanceMinor:Available`, type: 'currency', align: 'end' },
    { key: 'currentBalanceMinor', header: $localize`:@@accounts.accountList.col.currentBalanceMinor:Current`, type: 'currency', align: 'end' }
  ];

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(accountsActions.load());
  }

  reload(): void {
    this.store.dispatch(accountsActions.load());
  }

  open(row: Account): void {
    void this.router.navigate(['/accounts', row.accountId]);
  }
}
