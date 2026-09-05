import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards';
import { AccountDetailsResolver } from '../../core/resolvers';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';
import { DisputeTransactionComponent } from './components/dispute-transaction/dispute-transaction.component';

const routes: Routes = [
  { path: '', component: AccountListComponent },
  { path: ':accountId', component: AccountDetailComponent, resolve: { details: AccountDetailsResolver } },
  { path: ':accountId/transactions/:transactionId', component: TransactionDetailComponent },
  { path: ':accountId/transactions/:transactionId/dispute', component: DisputeTransactionComponent, canDeactivate: [UnsavedChangesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule {}
