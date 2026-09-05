import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedLegacyModule } from '../../shared/shared-legacy.module';
import { StepUpInterstitialComponent } from './step-up-interstitial/step-up-interstitial.component';
import { StepUpReasonComponent } from './step-up-reason/step-up-reason.component';

const routes: Routes = [{ path: '', component: StepUpInterstitialComponent }];

@NgModule({
  declarations: [StepUpInterstitialComponent, StepUpReasonComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedLegacyModule],
})
export class StepUpModule {}
