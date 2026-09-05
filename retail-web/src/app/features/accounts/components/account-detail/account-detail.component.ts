import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Detail header with balances, routing details, actions and the transaction list. */
@Component({
  selector: 'mol-account-detail',
  templateUrl: './account-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailComponent {}
