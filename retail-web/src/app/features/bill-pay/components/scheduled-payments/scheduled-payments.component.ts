import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { Bill } from '../../../../core/api/models';
import { billPayActions } from '../../store/bill-pay.actions';
import { billPaySelectors } from '../../store/bill-pay.selectors';

/** Payments queued to send. */
@Component({
  selector: 'mol-scheduled-payments',
  templateUrl: './scheduled-payments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduledPaymentsComponent implements OnInit {
  readonly rows$ = this.store.select(billPaySelectors.selectAll);
  readonly loading$ = this.store.select(billPaySelectors.selectLoading);
  readonly error$ = this.store.select(billPaySelectors.selectError);

  readonly columns: CnColumn<Bill>[] = [
    { key: 'payeeName', header: $localize`:@@billPay.scheduledPayments.col.payeeName:Payee` },
    { key: 'dueAt', header: $localize`:@@billPay.scheduledPayments.col.dueAt:Send on`, type: 'date' },
    { key: 'amountDueMinor', header: $localize`:@@billPay.scheduledPayments.col.amountDueMinor:Amount`, type: 'currency', align: 'end' }
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
