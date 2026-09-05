import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { TransfersRoutingModule } from './transfers-routing.module';
import { TransfersEffects } from './store/transfers.effects';
import { transfersFeatureKey, transfersReducer } from './store/transfers.reducer';
import { TransfersHomeComponent } from './components/transfers-home/transfers-home.component';
import { TransferWizardComponent } from './components/transfer-wizard/transfer-wizard.component';
import { TransferDetailsStepComponent } from './components/transfer-details-step/transfer-details-step.component';
import { TransferScheduleStepComponent } from './components/transfer-schedule-step/transfer-schedule-step.component';
import { TransferReviewStepComponent } from './components/transfer-review-step/transfer-review-step.component';
import { TransferConfirmationComponent } from './components/transfer-confirmation/transfer-confirmation.component';
import { ScheduledTransfersComponent } from './components/scheduled-transfers/scheduled-transfers.component';
import { TransferHistoryComponent } from './components/transfer-history/transfer-history.component';
import { TransferDetailComponent } from './components/transfer-detail/transfer-detail.component';
import { CancelTransferComponent } from './components/cancel-transfer/cancel-transfer.component';
import { PayeeListComponent } from './components/payee-list/payee-list.component';
import { AddPayeeComponent } from './components/add-payee/add-payee.component';
import { VerifyPayeeComponent } from './components/verify-payee/verify-payee.component';
import { TransferLimitsPanelComponent } from './components/transfer-limits-panel/transfer-limits-panel.component';

/** Move money: internal, external (ACH) and PayLink. Compliance-critical; anything above the configured threshold needs MFA step-up (MfaStepUpGuard). */
@NgModule({
  declarations: [
    TransfersHomeComponent,
    TransferWizardComponent,
    TransferDetailsStepComponent,
    TransferScheduleStepComponent,
    TransferReviewStepComponent,
    TransferConfirmationComponent,
    ScheduledTransfersComponent,
    TransferHistoryComponent,
    TransferDetailComponent,
    CancelTransferComponent,
    PayeeListComponent,
    AddPayeeComponent,
    VerifyPayeeComponent,
    TransferLimitsPanelComponent
  ],
  imports: [
    SharedModule,
    TransfersRoutingModule,
    StoreModule.forFeature(transfersFeatureKey, transfersReducer),
    EffectsModule.forFeature([TransfersEffects])
  ]
})
export class TransfersModule {}
