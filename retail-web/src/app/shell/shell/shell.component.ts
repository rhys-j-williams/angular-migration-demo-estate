import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { CnNavItem } from '@meridian/canopy-ui/layout';

import { ConfigService } from '../../core/config/config.service';
import { FeatureFlagService } from '../../core/flags/feature-flag.service';
import { sessionActions } from '../../core/store/session/session.actions';
import { selectDisplayName, selectEntitlements, selectIdleWarningSeconds, selectUnreadMessages } from '../../core/store/session/session.reducer';
import { IdleWarningDialogComponent } from '../idle-warning-dialog/idle-warning-dialog.component';

/**
 * Authenticated layout: Canopy page shell with the primary nav, sign out and the idle dialog.
 * Nav entries appear based on entitlements and flags; the order is the order Product signed off in
 * MOL-3302 and should not be "tidied".
 */
@Component({
  selector: 'mol-shell',
  template: `
    <cn-page-shell
      appName="Meridian Online"
      [environmentLabel]="environmentLabel"
      [nav]="(nav$ | async) ?? []"
      [userName]="displayName$ | async"
      [showThemeToggle]="true"
      (signOut)="signOut()">
      <router-outlet></router-outlet>
    </cn-page-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly displayName$ = this.store.select(selectDisplayName);
  readonly nav$: Observable<CnNavItem[]>;
  readonly environmentLabel: string | null;
  private idleSub?: Subscription;

  constructor(
    private readonly store: Store,
    private readonly dialog: MatDialog,
    private readonly flags: FeatureFlagService,
    config: ConfigService
  ) {
    this.environmentLabel = config.value.environment === 'prod' ? null : config.value.environment.toUpperCase();
    this.nav$ = combineLatest([
      this.store.select(selectEntitlements),
      this.store.select(selectUnreadMessages),
      this.flags.isEnabled$('mol.rewards.enabled'),
      this.flags.isEnabled$('mol.secure-messages.enabled')
    ]).pipe(map(([ent, unread, rewards, messages]) => this.buildNav(ent?.products ?? null, unread, rewards, messages)));
  }

  ngOnInit(): void {
    let ref: ReturnType<MatDialog['open']> | null = null;
    this.idleSub = this.store
      .select(selectIdleWarningSeconds)
      .pipe(map(s => s !== null), distinctUntilChanged())
      .subscribe(warning => {
        if (warning && !ref) {
          ref = this.dialog.open(IdleWarningDialogComponent, { disableClose: true, width: '440px', ariaLabel: 'Session about to end' });
          ref.afterClosed().subscribe(() => (ref = null));
        } else if (!warning && ref) {
          ref.close();
        }
      });
  }

  ngOnDestroy(): void {
    this.idleSub?.unsubscribe();
  }

  signOut(): void {
    this.store.dispatch(sessionActions.logout({ reason: 'user' }));
  }

  private buildNav(products: string[] | null, unread: number, rewards: boolean, messages: boolean): CnNavItem[] {
    const has = (p: string) => products === null || products.includes(p);
    const items: CnNavItem[] = [
      { id: 'dashboard', label: $localize`:@@nav.dashboard:Dashboard`, icon: 'home', link: '/dashboard' },
      { id: 'accounts', label: $localize`:@@nav.accounts:Accounts`, icon: 'account_balance', link: '/accounts' }
    ];
    if (has('transfers')) items.push({ id: 'transfers', label: $localize`:@@nav.transfers:Transfers`, icon: 'swap_horiz', link: '/transfers' });
    if (has('bill-pay')) items.push({ id: 'bill-pay', label: $localize`:@@nav.billPay:Bill pay`, icon: 'receipt_long', link: '/bill-pay' });
    if (has('cards')) items.push({ id: 'cards', label: $localize`:@@nav.cards:Cards`, icon: 'credit_card', link: '/cards' });
    items.push({ id: 'statements', label: $localize`:@@nav.statements:Statements`, icon: 'description', link: '/statements' });
    if (messages) items.push({ id: 'messages', label: $localize`:@@nav.messages:Messages`, icon: 'mail', link: '/messages', badge: unread || null });
    if (rewards && has('rewards')) items.push({ id: 'rewards', label: $localize`:@@nav.rewards:Rewards`, icon: 'stars', link: '/rewards' });
    items.push({ id: 'alerts', label: $localize`:@@nav.alerts:Alerts`, icon: 'notifications', link: '/alerts' });
    items.push({ id: 'profile', label: $localize`:@@nav.profile:Profile and security`, icon: 'manage_accounts', link: '/profile' });
    return items;
  }
}
