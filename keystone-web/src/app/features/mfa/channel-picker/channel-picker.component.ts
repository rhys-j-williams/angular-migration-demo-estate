import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { IdpClientService, MfaChannel } from '../../../core/auth/idp-client.service';
import { MfaTransaction, MfaTransactionService } from '../../../core/auth/mfa-transaction.service';

interface ChannelOption {
  channel: MfaChannel;
  label: string;
  hint: string;
  icon: string;
  route: string | null;
}

/**
 * "How would you like to get your code?". Options are static here; the IdP knows which the
 * customer actually has enrolled and returns 400 for the ones they do not, which we surface as a
 * generic message. KEY-1307 wanted the enrolled channel list in the /login response. Still wants.
 */
@Component({
  selector: 'ks-channel-picker',
  templateUrl: './channel-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelPickerComponent {
  readonly txn: MfaTransaction | null = this.mfa.snapshot;
  busy = false;
  error: string | null = null;

  readonly options: ChannelOption[] = [
    { channel: 'sms', label: 'Text message', hint: 'To your mobile number on file', icon: 'cn:help', route: '/mfa' },
    { channel: 'email', label: 'Email', hint: 'To your email address on file', icon: 'cn:document', route: '/mfa' },
    { channel: 'push', label: 'Meridian app', hint: 'Approve in the mobile banking app', icon: 'cn:bell', route: '/mfa/push' },
    { channel: 'totp', label: 'Authenticator app', hint: 'Use the 6 digit code from your app', icon: 'cn:lock', route: '/mfa/authenticator' },
  ];

  constructor(
    private readonly mfa: MfaTransactionService,
    private readonly idp: IdpClientService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  choose(option: ChannelOption): void {
    if (!this.txn || this.busy) {
      return;
    }
    this.busy = true;
    this.error = null;
    this.idp.requestOtp(this.txn.txn, option.channel).subscribe({
      next: (r) => {
        this.busy = false;
        this.mfa.switchChannel(option.channel, r.maskedDestination);
        void this.router.navigate([option.route ?? '/mfa']);
      },
      error: () => {
        this.busy = false;
        this.error = 'That option is not available for your profile. Please choose another.';
        this.cdr.markForCheck();
      },
    });
  }

  back(): void {
    void this.router.navigate(['/mfa']);
  }
}
