import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { BillPayRoutingModule } from './bill-pay-routing.module';
import { BillPayEffects } from './store/bill-pay.effects';
import { billPayFeatureKey, billPayReducer } from './store/bill-pay.reducer';
import { BillPayHomeComponent } from './components/bill-pay-home/bill-pay-home.component';
import { BillDetailComponent } from './components/bill-detail/bill-detail.component';
import { PayBillComponent } from './components/pay-bill/pay-bill.component';
import { ScheduledPaymentsComponent } from './components/scheduled-payments/scheduled-payments.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { AddBillPayeeComponent } from './components/add-bill-payee/add-bill-payee.component';
import { AutopaySettingsComponent } from './components/autopay-settings/autopay-settings.component';
import { CancelPaymentComponent } from './components/cancel-payment/cancel-payment.component';

/** Bill payments to registered payees, eBills and autopay. Runs on the same payments rail as transfers. */
@NgModule({
  declarations: [
    BillPayHomeComponent,
    BillDetailComponent,
    PayBillComponent,
    ScheduledPaymentsComponent,
    PaymentHistoryComponent,
    AddBillPayeeComponent,
    AutopaySettingsComponent,
    CancelPaymentComponent
  ],
  imports: [
    SharedModule,
    BillPayRoutingModule,
    StoreModule.forFeature(billPayFeatureKey, billPayReducer),
    EffectsModule.forFeature([BillPayEffects])
  ]
})
export class BillPayModule {}
