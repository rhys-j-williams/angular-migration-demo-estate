import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RateLimitBannerComponent } from '../../shared/components/rate-limit-banner/rate-limit-banner.component';
import { SharedLegacyModule } from '../../shared/shared-legacy.module';
import { mfaTransactionGuard } from './mfa-transaction.guard';
import { AuthenticatorAppComponent } from './authenticator-app/authenticator-app.component';
import { ChannelPickerComponent } from './channel-picker/channel-picker.component';
import { OtpChallengeComponent } from './otp-challenge/otp-challenge.component';
import { OtpInputComponent } from './otp-input/otp-input.component';
import { PushApprovalComponent } from './push-approval/push-approval.component';

const routes: Routes = [
  { path: '', component: OtpChallengeComponent, canActivate: [mfaTransactionGuard] },
  { path: 'channel', component: ChannelPickerComponent, canActivate: [mfaTransactionGuard] },
  { path: 'push', component: PushApprovalComponent, canActivate: [mfaTransactionGuard] },
  { path: 'authenticator', component: AuthenticatorAppComponent, canActivate: [mfaTransactionGuard] },
];

/**
 * Second factor screens. Legacy Material apart from OtpInputComponent, which was rewritten as a
 * standalone MDC component for the accessibility remediation in KEY-2105 and dragged the MDC
 * modules into this bundle with it. The rest is waiting on KEY-2210.
 */
@NgModule({
  declarations: [OtpChallengeComponent, ChannelPickerComponent, PushApprovalComponent, AuthenticatorAppComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), SharedLegacyModule, RateLimitBannerComponent, OtpInputComponent],
})
export class MfaModule {}
