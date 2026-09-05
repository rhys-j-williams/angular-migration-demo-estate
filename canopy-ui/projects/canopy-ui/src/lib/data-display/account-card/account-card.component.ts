import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { CN_CONFIG, CnConfig, CnCurrencyFormatService } from '@meridian/canopy-ui/core';

export type CnAccountKind = 'checking' | 'savings' | 'credit' | 'loan' | 'investment' | 'business';
export type CnAccountStatus = 'open' | 'frozen' | 'closed' | 'pending';

/**
 * Minimal shape the card needs. Consumers map their own account DTO onto it; do not add fields
 * from a specific back end here (see the Keystone incident in CHANGELOG 3.2.1).
 */
export interface CnAccountSummary {
  id: string;
  nickname: string;
  kind: CnAccountKind;
  /** Last four digits only. The card never receives the full number. */
  last4: string;
  currency: string;
  currentBalance: number;
  availableBalance?: number;
  status?: CnAccountStatus;
  /** For credit and loan accounts. */
  creditLimit?: number;
  /** Day-over-day change, used for the trend arrow. */
  changeSinceYesterday?: number;
}

const KIND_ICON: Record<CnAccountKind, string> = {
  checking: 'cn:account',
  savings: 'cn:lock',
  credit: 'cn:card',
  loan: 'cn:document',
  investment: 'cn:arrow-up',
  business: 'cn:home'
};

/**
 * Account tile for dashboards. Shows nickname, masked number, balance, and status. Whole card is
 * a button when `clickable`; balances can be hidden behind an eye toggle for over-the-shoulder
 * privacy (a11y note: the toggle announces its state).
 *
 *   <cn-account-card [account]="acct" clickable (selected)="open(acct)"></cn-account-card>
 */
@Component({
  selector: 'cn-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cn-account-card',
    '[class.cn-account-card--clickable]': 'clickable',
    '[class.cn-account-card--compact]': 'compact',
    '[attr.data-cn-kind]': 'account?.kind'
  }
})
export class CnAccountCardComponent {
  @Input() account: CnAccountSummary | null = null;
  @Input() clickable = false;
  @Input() compact = false;
  @Input() showAvailable = true;
  @Input() allowHideBalance = true;
  @Input() locale: string;

  @Output() readonly selected = new EventEmitter<CnAccountSummary>();

  balanceHidden = false;

  constructor(private readonly formatter: CnCurrencyFormatService, private readonly cdr: ChangeDetectorRef, @Inject(CN_CONFIG) config: CnConfig) {
    this.locale = config.locale;
  }

  get icon(): string {
    return this.account ? KIND_ICON[this.account.kind] : 'cn:account';
  }

  get maskedNumber(): string {
    return this.account ? `\u2022\u2022\u2022\u2022 ${this.account.last4}` : '';
  }

  get isLiability(): boolean {
    return this.account?.kind === 'credit' || this.account?.kind === 'loan';
  }

  get balanceLabel(): string {
    return this.isLiability ? 'Balance owed' : 'Current balance';
  }

  get statusLabel(): string | null {
    switch (this.account?.status) {
      case 'frozen': return 'Frozen';
      case 'closed': return 'Closed';
      case 'pending': return 'Pending';
      default: return null;
    }
  }

  get utilisation(): number | null {
    if (!this.account || !this.isLiability || !this.account.creditLimit) {
      return null;
    }
    return Math.min(100, Math.round((Math.abs(this.account.currentBalance) / this.account.creditLimit) * 100));
  }

  get trend(): 'up' | 'down' | 'flat' {
    const change = this.account?.changeSinceYesterday ?? 0;
    return change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  }

  format(value: number | undefined): string {
    if (value === undefined || !this.account) {
      return '\u2014';
    }
    return this.balanceHidden ? '\u2022\u2022\u2022\u2022\u2022\u2022' : this.formatter.format(value, this.account.currency, this.locale);
  }

  toggleHidden(event: Event): void {
    event.stopPropagation();
    this.balanceHidden = !this.balanceHidden;
    this.cdr.markForCheck();
  }

  select(): void {
    if (this.clickable && this.account) {
      this.selected.emit(this.account);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select();
    }
  }
}
