import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards';
import { ProfileHomeComponent } from './components/profile-home/profile-home.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { SecuritySettingsComponent } from './components/security-settings/security-settings.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChangeUsernameComponent } from './components/change-username/change-username.component';
import { MfaSettingsComponent } from './components/mfa-settings/mfa-settings.component';
import { TrustedDevicesComponent } from './components/trusted-devices/trusted-devices.component';
import { LoginHistoryComponent } from './components/login-history/login-history.component';

const routes: Routes = [
  { path: '', component: ProfileHomeComponent },
  { path: 'contact', component: ContactDetailsComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'address', component: AddressFormComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'security', component: SecuritySettingsComponent },
  { path: 'security/password', component: ChangePasswordComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'security/username', component: ChangeUsernameComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'security/mfa', component: MfaSettingsComponent },
  { path: 'security/devices', component: TrustedDevicesComponent },
  { path: 'security/activity', component: LoginHistoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
