import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { CredentialResult, IdpClientService } from '../../../core/auth/idp-client.service';
import { MfaTransactionService } from '../../../core/auth/mfa-transaction.service';
import { RateLimitStateService } from '../../../core/http/rate-limit-state.service';
import { AuthTelemetryService } from '../../../core/telemetry/auth-telemetry.service';
import { Credentials } from '../credential-form/credential-form.component';

/**
 * Landing screen. Two ways in: the customer typed the URL (no txn), or the IdP's authorize
 * endpoint bounced them here with ?txn=... because the calling app started a code flow. In the
 * first case we start our own code flow so there is always a txn to post the password against.
 */
@Component({
  selector: 'ks-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit, OnDestroy {
  txn: string | null = null;
  returnTo: string | null = null;
  busy = false;
  error: string | null = null;
  discoveryFailed = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly idp: IdpClientService,
    private readonly mfa: MfaTransactionService,
    private readonly session: AuthSessionService,
    private readonly rateLimit: RateLimitStateService,
    private readonly telemetry: AuthTelemetryService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.txn = params.get('txn');
      this.returnTo = params.get('return_to');
      this.error = params.get('error') === 'login_required' ? 'Please sign in again.' : null;
      this.cdr.markForCheck();
    });
    this.telemetry.record('login.shown');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(creds: Credentials): void {
    if (this.rateLimit.isLimited) {
      return;
    }
    if (!this.txn) {
      // No IdP transaction yet: start the code flow, the IdP will send us straight back with one.
      this.busy = true;
      this.session.startLogin(this.returnTo ?? undefined, { login_hint: creds.username }).catch(() => {
        this.busy = false;
        this.discoveryFailed = true;
        this.cdr.markForCheck();
      });
      return;
    }
    this.busy = true;
    this.error = null;
    this.telemetry.record('login.submitted');
    const txn = this.txn;
    this.idp.submitCredentials(txn, creds.username, creds.password).subscribe({
      next: (result) => this.handleResult(result, creds.username),
      error: () => {
        this.busy = false;
        this.error = 'We are having trouble signing you in right now. Please try again in a few minutes.';
        this.cdr.markForCheck();
      },
    });
  }

  private handleResult(result: CredentialResult, username: string): void {
    this.busy = false;
    switch (result.outcome) {
      case 'mfa_required':
        this.mfa.begin(result.txn, username, result.maskedDestination, this.returnTo);
        void this.router.navigate(['/mfa'], { queryParams: { txn: result.txn } });
        return;
      case 'locked':
        void this.router.navigate(['/locked']);
        return;
      case 'expired':
        this.error = 'That sign in session has expired. Please start again.';
        this.txn = null;
        break;
      case 'invalid_credentials':
      default:
        this.telemetry.record('login.failed');
        this.error = 'We could not sign you in with those details.';
    }
    this.cdr.markForCheck();
  }
}
