import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { BillPayApiService } from '../../../../core/api/bill-pay-api.service';
import { TransfersApiService } from '../../../../core/api/transfers-api.service';

export interface UpcomingItem {
  id: string;
  when: string;
  label: string;
  amountMinor: number;
  kind: 'transfer' | 'bill';
  link: unknown[];
}

const HORIZON_DAYS = 14;

/** Scheduled transfers and bills due in the next 14 days, merged and sorted by date. */
@Component({
  selector: 'mol-upcoming-payments',
  templateUrl: './upcoming-payments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingPaymentsComponent implements OnInit {
  items$!: Observable<UpcomingItem[]>;

  constructor(private readonly transfers: TransfersApiService, private readonly billPay: BillPayApiService) {}

  ngOnInit(): void {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + HORIZON_DAYS);
    const cutoff = horizon.toISOString().slice(0, 10);

    const transfers$ = this.transfers.scheduled().pipe(
      map(list => list.filter(t => t.scheduledFor <= cutoff).map<UpcomingItem>(t => ({
        id: t.transferId, when: t.scheduledFor, kind: 'transfer', amountMinor: t.amountMinor,
        label: t.memo || (t.type === 'internal' ? 'Transfer between accounts' : 'External transfer'),
        link: ['/transfers', t.transferId]
      }))),
      catchError(() => of([] as UpcomingItem[]))
    );
    const bills$ = this.billPay.bills().pipe(
      map(list => list.filter(b => (b.status === 'due' || b.status === 'scheduled' || b.status === 'overdue') && b.dueAt <= cutoff).map<UpcomingItem>(b => ({
        id: b.billId, when: b.dueAt, kind: 'bill', amountMinor: b.amountDueMinor, label: b.payeeName, link: ['/bill-pay']
      }))),
      catchError(() => of([] as UpcomingItem[]))
    );
    this.items$ = combineLatest([transfers$, bills$]).pipe(map(([a, b]) => [...a, ...b].sort((x, y) => x.when.localeCompare(y.when))));
  }

  total(items: UpcomingItem[]): number {
    return items.reduce((sum, i) => sum + i.amountMinor, 0);
  }
}
