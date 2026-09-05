import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { Bill } from '../../../../core/api/models';
import { billPayActions } from '../../store/bill-pay.actions';
import { billPaySelectors } from '../../store/bill-pay.selectors';

/** Sent payments, 24 months. */
@Component({
  selector: 'mol-payment-history',
  templateUrl: './payment-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentHistoryComponent implements OnInit {
  readonly rows$ = this.store.select(billPaySelectors.selectAll);
  readonly loading$ = this.store.select(billPaySelectors.selectLoading);
  readonly error$ = this.store.select(billPaySelectors.selectError);

  readonly columns: CnColumn<Bill>[] = [
    { key: 'payeeName', header: $localize`:@@billPay.paymentHistory.col.payeeName:Payee` },
    { key: 'lastPaidAt', header: $localize`:@@billPay.paymentHistory.col.lastPaidAt:Paid`, type: 'date' },
    { key: 'amountDueMinor', header: $localize`:@@billPay.paymentHistory.col.amountDueMinor:Amount`, type: 'currency', align: 'end' },
    { key: 'status', header: $localize`:@@billPay.paymentHistory.col.status:Status` }
  ];

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(billPayActions.load());
  }

  reload(): void {
    this.store.dispatch(billPayActions.load());
  }

  open(row: Bill): void {
    void this.router.navigate(['/bill-pay/bills', row.billId]);
  }
}
