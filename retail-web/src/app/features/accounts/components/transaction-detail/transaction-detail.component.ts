import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Single transaction with merchant, status, running balance and dispute entry point. */
@Component({
  selector: 'mol-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailComponent {}
