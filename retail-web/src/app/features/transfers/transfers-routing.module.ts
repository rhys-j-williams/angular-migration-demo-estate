import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MfaStepUpGuard, UnsavedChangesGuard } from '../../core/guards';
import { AccountsResolver, TransferLimitsResolver } from '../../core/resolvers';
import { TransfersHomeComponent } from './components/transfers-home/transfers-home.component';
import { TransferWizardComponent } from './components/transfer-wizard/transfer-wizard.component';
import { TransferReviewStepComponent } from './components/transfer-review-step/transfer-review-step.component';
import { TransferConfirmationComponent } from './components/transfer-confirmation/transfer-confirmation.component';
import { TransferHistoryComponent } from './components/transfer-history/transfer-history.component';
import { TransferDetailComponent } from './components/transfer-detail/transfer-detail.component';
import { PayeeListComponent } from './components/payee-list/payee-list.component';
import { AddPayeeComponent } from './components/add-payee/add-payee.component';
import { VerifyPayeeComponent } from './components/verify-payee/verify-payee.component';

const routes: Routes = [
  { path: '', component: TransfersHomeComponent },
  { path: 'new', component: TransferWizardComponent, canDeactivate: [UnsavedChangesGuard], resolve: { accounts: AccountsResolver, limits: TransferLimitsResolver } },
  { path: 'new/review', component: TransferReviewStepComponent, canActivate: [MfaStepUpGuard] },
  { path: ':transferId/confirmation', component: TransferConfirmationComponent },
  { path: 'history', component: TransferHistoryComponent },
  { path: ':transferId', component: TransferDetailComponent },
  { path: 'payees', component: PayeeListComponent },
  { path: 'payees/new', component: AddPayeeComponent, canActivate: [MfaStepUpGuard], canDeactivate: [UnsavedChangesGuard], data: { mfaThresholdMinor: 0 } },
  { path: 'payees/:payeeId/verify', component: VerifyPayeeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfersRoutingModule {}
