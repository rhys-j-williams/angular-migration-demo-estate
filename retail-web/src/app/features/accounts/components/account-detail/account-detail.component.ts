import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CnAccountKind, CnAccountSummary } from '@meridian/canopy-ui/data-display';

import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { accountsActions } from '../../store/accounts.actions';

const KIND: Record<AccountDetails['type'], CnAccountKind> = {
  checking: 'checking', savings: 'savings', 'credit-card': 'credit', mortgage: 'loan', 'auto-loan': 'loan',
  certificate: 'investment', 'business-checking': 'business', 'business-savings': 'business', 'treasury-operating': 'business'
};

/**
 * Detail header with balances, routing details, actions and the transaction list.
 *
 * Data arrives through AccountDetailsResolver (route data `details`) so the header never renders
 * in a half loaded state - the old in-component fetch produced a visible balance flash that
 * Accessibility flagged in the 2022 audit (MOL-2588). The transaction list below loads on its own.
 */
@Component({
  selector: 'mol-account-detail',
  templateUrl: './account-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  details$: Observable<AccountDetails> = this.route.data.pipe(map(d => d['details'] as AccountDetails));
  tab = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store,
    private readonly lantern: LanternService
  ) {}

  ngOnInit(): void {
    this.details$.pipe(takeUntil(this.destroy$)).subscribe(d => {
      this.store.dispatch(accountsActions.select({ id: d.accountId }));
      this.lantern.page('account.detail', { accountType: d.type });
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(accountsActions.select({ id: null }));
    this.destroy$.next();
    this.destroy$.complete();
  }

  summary(d: AccountDetails): CnAccountSummary {
    return {
      id: d.accountId,
      nickname: d.nickname,
      kind: KIND[d.type],
      last4: d.accountNumber.slice(-4),
      currency: d.currency,
      currentBalance: d.currentBalanceMinor / 100,
      availableBalance: d.availableBalanceMinor / 100,
      creditLimit: d.creditLimitMinor !== undefined ? d.creditLimitMinor / 100 : undefined,
      status: d.status === 'restricted' ? 'frozen' : d.status === 'dormant' ? 'pending' : d.status
    };
  }

  isLiability(d: AccountDetails): boolean {
    return d.type === 'credit-card' || d.type === 'mortgage' || d.type === 'auto-loan';
  }

  isDeposit(d: AccountDetails): boolean {
    return d.type === 'checking' || d.type === 'savings' || d.type === 'business-checking' || d.type === 'business-savings';
  }

  renamed(): void {
    // Resolver data is a snapshot; re-run the route so the header picks up the new nickname.
    this.store.dispatch(accountsActions.invalidate());
    const url = this.router.url;
    void this.router.navigateByUrl('/accounts', { skipLocationChange: true }).then(() => this.router.navigateByUrl(url));
  }
}
