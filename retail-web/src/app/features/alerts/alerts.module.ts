import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { AlertsRoutingModule } from './alerts-routing.module';
import { AlertsEffects } from './store/alerts.effects';
import { alertsFeatureKey, alertsReducer } from './store/alerts.reducer';
import { AlertsHomeComponent } from './components/alerts-home/alerts-home.component';
import { AlertPreferencesComponent } from './components/alert-preferences/alert-preferences.component';
import { AlertPreferenceRowComponent } from './components/alert-preference-row/alert-preference-row.component';
import { ChannelPickerComponent } from './components/channel-picker/channel-picker.component';
import { QuietHoursComponent } from './components/quiet-hours/quiet-hours.component';
import { AlertHistoryComponent } from './components/alert-history/alert-history.component';
import { TestAlertComponent } from './components/test-alert/test-alert.component';

/** Alert preferences (regulatory and optional), delivery channels, quiet hours and alert history. */
@NgModule({
  declarations: [
    AlertsHomeComponent,
    AlertPreferencesComponent,
    AlertPreferenceRowComponent,
    ChannelPickerComponent,
    QuietHoursComponent,
    AlertHistoryComponent,
    TestAlertComponent
  ],
  imports: [
    SharedModule,
    AlertsRoutingModule,
    StoreModule.forFeature(alertsFeatureKey, alertsReducer),
    EffectsModule.forFeature([AlertsEffects])
  ]
})
export class AlertsModule {}
