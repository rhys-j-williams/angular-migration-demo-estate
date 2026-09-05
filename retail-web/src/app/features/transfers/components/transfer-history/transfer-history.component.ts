import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { Transfer } from '../../../../core/api/models';
import { transfersActions } from '../../store/transfers.actions';
import { transfersSelectors } from '../../store/transfers.selectors';

/** Completed and failed transfers. */
@Component({
  selector: 'mol-transfer-history',
  templateUrl: './transfer-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferHistoryComponent implements OnInit {
  readonly rows$ = this.store.select(transfersSelectors.selectAll);
  readonly loading$ = this.store.select(transfersSelectors.selectLoading);
  readonly error$ = this.store.select(transfersSelectors.selectError);

  readonly columns: CnColumn<Transfer>[] = [
    { key: 'createdAt', header: $localize`:@@transfers.transferHistory.col.createdAt:Date`, type: 'date' },
    { key: 'confirmationNumber', header: $localize`:@@transfers.transferHistory.col.confirmationNumber:Confirmation` },
    { key: 'amountMinor', header: $localize`:@@transfers.transferHistory.col.amountMinor:Amount`, type: 'currency', align: 'end' },
    { key: 'status', header: $localize`:@@transfers.transferHistory.col.status:Status` }
  ];

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(transfersActions.load());
  }

  reload(): void {
    this.store.dispatch(transfersActions.load());
  }

  open(row: Transfer): void {
    void this.router.navigate(['/transfers', row.transferId]);
  }
}
