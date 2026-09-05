import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DeviceTrustPromptComponent } from '../device-trust/device-trust-prompt/device-trust-prompt.component';
import { HelpLinksComponent } from '../../shared/components/help-links/help-links.component';
import { RateLimitBannerComponent } from '../../shared/components/rate-limit-banner/rate-limit-banner.component';
import { SharedLegacyModule } from '../../shared/shared-legacy.module';
import { CredentialFormComponent } from './credential-form/credential-form.component';
import { LockedOutComponent } from './locked-out/locked-out.component';
import { LoginPageComponent } from './login-page/login-page.component';

const routes: Routes = [
  { path: '', component: LoginPageComponent },
  { path: 'locked', component: LockedOutComponent },
];

/**
 * The credential screen and its friends. Still on the legacy Material modules (KEY-2210); this is
 * the highest traffic screen in the bank and the one nobody wants to be the person who changed.
 */
@NgModule({
  declarations: [
    LoginPageComponent,
    CredentialFormComponent,
    LockedOutComponent,
    // TODO(KEY-2210): DeviceTrustPromptComponent went standalone in the first MDC pass and is now
    // imported below. Leaving this here until the rest of the module follows so the diff is obvious.
    // DeviceTrustPromptComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedLegacyModule,
    RateLimitBannerComponent,
    HelpLinksComponent,
    DeviceTrustPromptComponent,
  ],
})
export class LoginModule {}
