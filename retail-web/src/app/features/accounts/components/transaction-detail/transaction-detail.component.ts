import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Transaction } from '../../../../core/api/models';

const DISPUTE_WINDOW_DAYS = 60;

/** Single transaction with merchant, channel and the dispute entry point. */
@Component({
  selector: 'mol-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailComponent {
  readonly accountId = this.route.snapshot.paramMap.get('accountId') ?? '';
  readonly txn$: Observable<Transaction> = this.route.paramMap.pipe(
    map(p => [p.get('accountId') ?? '', p.get('transactionId') ?? ''] as const),
    switchMap(([accountId, transactionId]) => this.api.transaction(accountId, transactionId))
  );

  constructor(private readonly route: ActivatedRoute, private readonly api: AccountsApiService) {}

  /** Reg E gives 60 days from the statement; we approximate from the posting date. */
  canDispute(t: Transaction, now: Date = new Date()): boolean {
    if (t.status !== 'posted' || t.amountMinor >= 0) return false;
    if (t.channel !== 'card' && t.channel !== 'ach' && t.channel !== 'atm') return false;
    const posted = new Date(t.postedAt).getTime();
    return now.getTime() - posted <= DISPUTE_WINDOW_DAYS * 86_400_000;
  }

  channelLabel(c: Transaction['channel']): string {
    switch (c) {
      case 'card': return 'Card purchase';
      case 'ach': return 'ACH';
      case 'wire': return 'Wire';
      case 'internal': return 'Transfer';
      case 'paylink': return 'PayLink';
      case 'check': return 'Check';
      case 'atm': return 'ATM';
      case 'fee': return 'Fee';
    }
  }
}
