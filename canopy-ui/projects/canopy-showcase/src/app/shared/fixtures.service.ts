import { Injectable } from '@angular/core';
import {
  Account,
  Customer,
  FixtureSet,
  Payee,
  Transaction,
  generateFixtures,
  maskAccountNumber
} from '@meridian/domain-fixtures';
import { CnAccountKind, CnAccountStatus, CnAccountSummary } from '@meridian/canopy-ui/data-display';

/** Row shape the showcase tables use. Minor units are converted once, here, not in templates. */
export interface TxnRow {
  id: string;
  postedAt: string;
  description: string;
  merchant: string;
  category: string;
  channel: string;
  amount: number;
  balance: number;
  status: Transaction['status'];
  currency: 'USD';
}

const KIND: Record<Account['type'], CnAccountKind> = {
  checking: 'checking',
  savings: 'savings',
  certificate: 'savings',
  'credit-card': 'credit',
  mortgage: 'loan',
  'auto-loan': 'loan',
  'business-checking': 'business',
  'business-savings': 'business',
  'treasury-operating': 'business'
};

const STATUS: Record<Account['status'], CnAccountStatus> = {
  open: 'open',
  dormant: 'pending',
  restricted: 'frozen',
  closed: 'closed'
};

/**
 * Everything on the showcase comes out of `@meridian/domain-fixtures` with the `CNPY-showcase`
 * seed, so a screenshot taken for a design review matches the one in the visual regression run.
 * Do not hand-write customer or card data here; the forbidden strings hook will not catch a
 * plausible looking account number but the data classification review will.
 */
@Injectable({ providedIn: 'root' })
export class ShowcaseFixturesService {
  readonly estate: FixtureSet = generateFixtures({ seed: 'CNPY-showcase', customers: 12 });

  get customer(): Customer {
    return this.estate.customers[0];
  }

  get accounts(): Account[] {
    return this.estate.accounts.filter(a => a.customerId === this.customer.customerId);
  }

  get payees(): Payee[] {
    return this.estate.payees.filter(p => p.customerId === this.customer.customerId);
  }

  transactions(accountId?: string): TxnRow[] {
    const ids = accountId ? [accountId] : this.accounts.map(a => a.accountId);
    return this.estate.transactions
      .filter(t => ids.includes(t.accountId))
      .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
      .map(t => ({
        id: t.transactionId,
        postedAt: t.postedAt,
        description: t.description,
        merchant: t.merchantName,
        category: t.category,
        channel: t.channel,
        amount: t.amountMinor / 100,
        balance: t.runningBalanceMinor / 100,
        status: t.status,
        currency: 'USD'
      }));
  }

  /** Big enough to make virtual scrolling worth it. Every customer's transactions, not just ours. */
  allTransactions(): TxnRow[] {
    return this.estate.transactions
      .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
      .map(t => ({
        id: t.transactionId,
        postedAt: t.postedAt,
        description: t.description,
        merchant: t.merchantName,
        category: t.category,
        channel: t.channel,
        amount: t.amountMinor / 100,
        balance: t.runningBalanceMinor / 100,
        status: t.status,
        currency: 'USD'
      }));
  }

  summaries(): CnAccountSummary[] {
    return this.accounts.map(a => this.toSummary(a));
  }

  toSummary(a: Account): CnAccountSummary {
    const txns = this.estate.transactions.filter(t => t.accountId === a.accountId);
    const yesterday = txns.slice(-3).reduce((sum, t) => sum + t.amountMinor, 0) / 100;
    return {
      id: a.accountId,
      nickname: a.nickname,
      kind: KIND[a.type],
      last4: maskAccountNumber(a.accountNumber).slice(-4),
      currency: a.currency,
      currentBalance: a.currentBalanceMinor / 100,
      availableBalance: a.availableBalanceMinor / 100,
      status: STATUS[a.status],
      creditLimit: a.creditLimitMinor !== undefined ? a.creditLimitMinor / 100 : undefined,
      changeSinceYesterday: yesterday
    };
  }
}
