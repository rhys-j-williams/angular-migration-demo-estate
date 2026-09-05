import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardEffects } from './store/dashboard.effects';
import { dashboardFeatureKey, dashboardReducer } from './store/dashboard.reducer';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { AccountsSummaryComponent } from './components/accounts-summary/accounts-summary.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { QuickTransferComponent } from './components/quick-transfer/quick-transfer.component';
import { SpendingSnapshotComponent } from './components/spending-snapshot/spending-snapshot.component';
import { UpcomingPaymentsComponent } from './components/upcoming-payments/upcoming-payments.component';
import { AlertsDigestComponent } from './components/alerts-digest/alerts-digest.component';
import { PromoBannerComponent } from './components/promo-banner/promo-banner.component';

/** Landing page after sign-in. Tiles are independent so one failing BFF call does not blank the page (MOL-2760). */
@NgModule({
  declarations: [
    DashboardOverviewComponent,
    AccountsSummaryComponent,
    RecentActivityComponent,
    QuickTransferComponent,
    SpendingSnapshotComponent,
    UpcomingPaymentsComponent,
    AlertsDigestComponent,
    PromoBannerComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule,
    StoreModule.forFeature(dashboardFeatureKey, dashboardReducer),
    EffectsModule.forFeature([DashboardEffects])
  ]
})
export class DashboardModule {}
