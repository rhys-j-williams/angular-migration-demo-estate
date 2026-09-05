import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileEffects } from './store/profile.effects';
import { profileFeatureKey, profileReducer } from './store/profile.reducer';
import { ProfileHomeComponent } from './components/profile-home/profile-home.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { SecuritySettingsComponent } from './components/security-settings/security-settings.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChangeUsernameComponent } from './components/change-username/change-username.component';
import { MfaSettingsComponent } from './components/mfa-settings/mfa-settings.component';
import { TrustedDevicesComponent } from './components/trusted-devices/trusted-devices.component';
import { LoginHistoryComponent } from './components/login-history/login-history.component';

/** Contact details, address, security settings, devices and login history. Uses the untyped forms API pending MOL-4471. */
@NgModule({
  declarations: [
    ProfileHomeComponent,
    ContactDetailsComponent,
    AddressFormComponent,
    SecuritySettingsComponent,
    ChangePasswordComponent,
    ChangeUsernameComponent,
    MfaSettingsComponent,
    TrustedDevicesComponent,
    LoginHistoryComponent
  ],
  imports: [
    SharedModule,
    ProfileRoutingModule,
    StoreModule.forFeature(profileFeatureKey, profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ]
})
export class ProfileModule {}
