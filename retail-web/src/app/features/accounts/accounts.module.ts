import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsEffects } from './store/accounts.effects';
import { accountsFeatureKey, accountsReducer } from './store/accounts.reducer';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';
import { TransactionFiltersComponent } from './components/transaction-filters/transaction-filters.component';
import { AccountActionsMenuComponent } from './components/account-actions-menu/account-actions-menu.component';
import { RoutingDetailsComponent } from './components/routing-details/routing-details.component';
import { RenameAccountComponent } from './components/rename-account/rename-account.component';
import { DisputeTransactionComponent } from './components/dispute-transaction/dispute-transaction.component';
import { ExportTransactionsComponent } from './components/export-transactions/export-transactions.component';
import { PendingTransactionsComponent } from './components/pending-transactions/pending-transactions.component';
import { InterestSummaryComponent } from './components/interest-summary/interest-summary.component';

/** Account list, detail and transaction history. The most-visited surface after the dashboard. */
@NgModule({
  declarations: [
    AccountListComponent,
    AccountDetailComponent,
    TransactionListComponent,
    TransactionDetailComponent,
    TransactionFiltersComponent,
    AccountActionsMenuComponent,
    RoutingDetailsComponent,
    RenameAccountComponent,
    DisputeTransactionComponent,
    ExportTransactionsComponent,
    PendingTransactionsComponent,
    InterestSummaryComponent
  ],
  imports: [
    SharedModule,
    AccountsRoutingModule,
    StoreModule.forFeature(accountsFeatureKey, accountsReducer),
    EffectsModule.forFeature([AccountsEffects])
  ]
})
export class AccountsModule {}
