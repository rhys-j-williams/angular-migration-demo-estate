import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, switchMap, takeUntil, timer } from 'rxjs';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { IdpClientService } from '../../../core/auth/idp-client.service';
import { MfaTransaction, MfaTransactionService } from '../../../core/auth/mfa-transaction.service';
import { environment } from '../../../../environments/environment';

/**
 * Waiting on the customer to tap Approve in the mobile app. We poll; the IdP does not push to us.
 * Polling interval and give-up time are in the environment because Ops wanted to slow it down
 * during INC-2023-0917 without a release. The "number match" digits stop the notification
 * fatigue attack Fraud raised in FRD-0412: the customer has to pick the number shown here.
 */
@Component({
  selector: 'ks-push-approval',
  templateUrl: './push-approval.component.html',
  styleUrls: ['./push-approval.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PushApprovalComponent implements OnInit, OnDestroy {
  txn: MfaTransaction | null = null;
  matchNumber = '';
  state: 'waiting' | 'denied' | 'timeout' = 'waiting';
  secondsLeft = Math.floor(environment.pushTimeoutMs / 1000);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly mfa: MfaTransactionService,
    private readonly idp: IdpClientService,
    private readonly session: AuthSessionService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.txn = this.mfa.snapshot;
    if (!this.txn) {
      return;
    }
    this.matchNumber = String(10 + (parseInt(this.txn.txn.replace(/\D/g, '').slice(-4) || '0', 10) % 90));
    const txn = this.txn.txn;
    timer(0, environment.pushPollIntervalMs)
      .pipe(
        switchMap(() => this.idp.pushStatus(txn)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (status) => {
          this.secondsLeft = Math.max(0, this.secondsLeft - environment.pushPollIntervalMs / 1000);
          if (status.state === 'approved') {
            this.mfa.complete();
            this.session.followIdpRedirect(status.redirectTo);
            this.destroy$.next();
          } else if (status.state === 'denied') {
            this.state = 'denied';
            this.destroy$.next();
          } else if (this.secondsLeft <= 0) {
            this.state = 'timeout';
            this.destroy$.next();
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.state = 'timeout';
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  useCodeInstead(): void {
    void this.router.navigate(['/mfa/channel']);
  }

  startOver(): void {
    this.mfa.abandon();
    void this.router.navigate(['/']);
  }
}
