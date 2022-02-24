import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards';
import { RewardsSummaryComponent } from './components/rewards-summary/rewards-summary.component';
import { RewardsActivityComponent } from './components/rewards-activity/rewards-activity.component';
import { RedeemPointsComponent } from './components/redeem-points/redeem-points.component';

const routes: Routes = [
  { path: '', component: RewardsSummaryComponent },
  { path: 'activity', component: RewardsActivityComponent },
  { path: 'redeem', component: RedeemPointsComponent, canDeactivate: [UnsavedChangesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RewardsRoutingModule {}
