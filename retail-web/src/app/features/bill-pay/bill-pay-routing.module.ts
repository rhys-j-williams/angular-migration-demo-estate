import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MfaStepUpGuard, UnsavedChangesGuard } from '../../core/guards';
import { BillPayHomeComponent } from './components/bill-pay-home/bill-pay-home.component';
import { BillDetailComponent } from './components/bill-detail/bill-detail.component';
import { PayBillComponent } from './components/pay-bill/pay-bill.component';
import { ScheduledPaymentsComponent } from './components/scheduled-payments/scheduled-payments.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { AddBillPayeeComponent } from './components/add-bill-payee/add-bill-payee.component';
import { AutopaySettingsComponent } from './components/autopay-settings/autopay-settings.component';

const routes: Routes = [
  { path: '', component: BillPayHomeComponent },
  { path: 'bills/:billId', component: BillDetailComponent },
  { path: 'bills/:billId/pay', component: PayBillComponent, canActivate: [MfaStepUpGuard], canDeactivate: [UnsavedChangesGuard] },
  { path: 'scheduled', component: ScheduledPaymentsComponent },
  { path: 'history', component: PaymentHistoryComponent },
  { path: 'payees/new', component: AddBillPayeeComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'bills/:billId/autopay', component: AutopaySettingsComponent, canDeactivate: [UnsavedChangesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillPayRoutingModule {}
