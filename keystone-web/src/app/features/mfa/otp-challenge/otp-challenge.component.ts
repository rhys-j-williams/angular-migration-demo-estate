import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { IdpClientService, MfaResult } from '../../../core/auth/idp-client.service';
import { MfaTransaction, MfaTransactionService } from '../../../core/auth/mfa-transaction.service';
import { AuthTelemetryService } from '../../../core/telemetry/auth-telemetry.service';
import { OtpInputComponent } from '../otp-input/otp-input.component';

const RESEND_COOLDOWN_S = 30;

/**
 * "Enter the code we sent to ***-***-1234". The surrounding chrome is legacy Material, the box
 * input inside it is MDC. Yes, that means both themes have to load for this one screen. KEY-2210.
 */
@Component({
  selector: 'ks-otp-challenge',
  templateUrl: './otp-challenge.component.html',
  styleUrls: ['./otp-challenge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpChallengeComponent implements OnInit, OnDestroy {
  @ViewChild(OtpInputComponent) otpInput?: OtpInputComponent;

  readonly code = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] });
  readonly trustDevice = new FormControl(false, { nonNullable: true });

  txn: MfaTransaction | null = null;
  busy = false;
  error: string | null = null;
  resendIn = 0;
  resent = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly mfa: MfaTransactionService,
    private readonly idp: IdpClientService,
    private readonly session: AuthSessionService,
    private readonly router: Router,
    private readonly telemetry: AuthTelemetryService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.txn = this.mfa.snapshot;
    this.telemetry.record('mfa.otp.shown');
    this.startCooldown();
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.resendIn > 0) {
          this.resendIn--;
          this.cdr.markForCheck();
        }
        if (this.txn && this.mfa.isExpired) {
          this.expire();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get destinationLabel(): string {
    if (!this.txn) {
      return '';
    }
    return this.txn.channel === 'email' ? `the email address ending ${this.txn.maskedDestination}` : `the phone number ending ${this.txn.maskedDestination}`;
  }

  submit(code: string = this.code.value): void {
    if (!this.txn || this.busy || !/^\d{6}$/.test(code)) {
      this.code.markAsTouched();
      return;
    }
    this.busy = true;
    this.error = null;
    this.idp.submitOtp(this.txn.txn, code).subscribe({
      next: (r) => this.handle(r),
      error: () => {
        this.busy = false;
        this.error = 'We could not check that code right now. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }

  resend(): void {
    if (!this.txn || this.resendIn > 0) {
      return;
    }
    this.idp.requestOtp(this.txn.txn, this.txn.channel).subscribe(() => {
      this.resent = true;
      this.startCooldown();
      this.cdr.markForCheck();
    });
  }

  changeChannel(): void {
    void this.router.navigate(['/mfa/channel']);
  }

  private handle(r: MfaResult): void {
    this.busy = false;
    switch (r.outcome) {
      case 'ok':
        this.telemetry.record('mfa.otp.passed');
        this.mfa.complete();
        if (this.trustDevice.value) {
          void this.router.navigate(['/device-trust'], { queryParams: { next: r.redirectTo } });
        } else {
          this.session.followIdpRedirect(r.redirectTo);
        }
        return;
      case 'invalid_code': {
        const left = this.mfa.recordFailure();
        this.telemetry.record('mfa.otp.failed');
        this.error = left > 0 ? `That code is not right. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect codes.';
        this.otpInput?.reset();
        if (left <= 0) {
          this.mfa.abandon();
          void this.router.navigate(['/locked']);
        }
        break;
      }
      case 'expired':
        this.expire();
        return;
    }
    this.cdr.markForCheck();
  }

  private expire(): void {
    this.mfa.abandon();
    void this.router.navigate(['/'], { queryParams: { error: 'login_required' } });
  }

  private startCooldown(): void {
    this.resendIn = RESEND_COOLDOWN_S;
  }
}
