import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { Bill } from '../../../../core/api/models';
import { billPayActions } from '../../store/bill-pay.actions';
import { billPaySelectors } from '../../store/bill-pay.selectors';

/** Bills due, with pay-now entry points. */
@Component({
  selector: 'mol-bill-pay-home',
  templateUrl: './bill-pay-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillPayHomeComponent implements OnInit {
  readonly rows$ = this.store.select(billPaySelectors.selectAll);
  readonly loading$ = this.store.select(billPaySelectors.selectLoading);
  readonly error$ = this.store.select(billPaySelectors.selectError);

  readonly columns: CnColumn<Bill>[] = [
    { key: 'payeeName', header: $localize`:@@billPay.billPayHome.col.payeeName:Payee` },
    { key: 'dueAt', header: $localize`:@@billPay.billPayHome.col.dueAt:Due`, type: 'date' },
    { key: 'amountDueMinor', header: $localize`:@@billPay.billPayHome.col.amountDueMinor:Amount due`, type: 'currency', align: 'end' },
    { key: 'status', header: $localize`:@@billPay.billPayHome.col.status:Status` }
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
