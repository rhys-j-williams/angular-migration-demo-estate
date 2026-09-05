import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { IdpClientService } from '../../../core/auth/idp-client.service';
import { MfaTransaction, MfaTransactionService } from '../../../core/auth/mfa-transaction.service';
import { OtpInputComponent } from '../otp-input/otp-input.component';

/**
 * TOTP entry. Nearly a copy of OtpChallengeComponent without resend. Someone should merge them.
 * KEY-1650 was raised for that in 2022.
 */
@Component({
  selector: 'ks-authenticator-app',
  templateUrl: './authenticator-app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatorAppComponent {
  @ViewChild(OtpInputComponent) otpInput?: OtpInputComponent;

  readonly code = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] });
  readonly txn: MfaTransaction | null = this.mfa.snapshot;
  busy = false;
  error: string | null = null;

  constructor(
    private readonly mfa: MfaTransactionService,
    private readonly idp: IdpClientService,
    private readonly session: AuthSessionService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  submit(code: string = this.code.value): void {
    if (!this.txn || this.busy || !/^\d{6}$/.test(code)) {
      this.code.markAsTouched();
      return;
    }
    this.busy = true;
    this.error = null;
    this.idp.submitTotp(this.txn.txn, code).subscribe({
      next: (r) => {
        this.busy = false;
        if (r.outcome === 'success') {
          this.mfa.complete();
          this.session.followIdpRedirect(r.redirectTo);
          return;
        }
        if (r.outcome === 'expired') {
          this.mfa.abandon();
          void this.router.navigate(['/'], { queryParams: { error: 'login_required' } });
          return;
        }
        const left = this.mfa.recordAttempt();
        this.error = left > 0 ? 'That code is not right. Check the time on your phone and try again.' : 'Too many incorrect codes.';
        this.otpInput?.reset();
        if (left <= 0) {
          this.mfa.abandon();
          void this.router.navigate(['/locked']);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.busy = false;
        this.error = 'We could not check that code right now.';
        this.cdr.markForCheck();
      },
    });
  }

  changeChannel(): void {
    void this.router.navigate(['/mfa/channel']);
  }
}
