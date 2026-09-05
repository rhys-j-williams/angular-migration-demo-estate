import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { RewardsRoutingModule } from './rewards-routing.module';
import { RewardsEffects } from './store/rewards.effects';
import { rewardsFeatureKey, rewardsReducer } from './store/rewards.reducer';
import { RewardsSummaryComponent } from './components/rewards-summary/rewards-summary.component';
import { RewardsActivityComponent } from './components/rewards-activity/rewards-activity.component';
import { RedeemPointsComponent } from './components/redeem-points/redeem-points.component';

/** Meridian Rewards points balance and redemption. Behind flag mol.rewards.enabled; credit card customers only. */
@NgModule({
  declarations: [
    RewardsSummaryComponent,
    RewardsActivityComponent,
    RedeemPointsComponent
  ],
  imports: [
    SharedModule,
    RewardsRoutingModule,
    StoreModule.forFeature(rewardsFeatureKey, rewardsReducer),
    EffectsModule.forFeature([RewardsEffects])
  ]
})
export class RewardsModule {}
