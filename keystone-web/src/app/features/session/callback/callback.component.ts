import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { Router, RouterModule } from '@angular/router';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { StepUpService } from '../../../core/auth/step-up.service';
import { AuthTelemetryService } from '../../../core/telemetry/auth-telemetry.service';

/**
 * /callback. angular-oauth2-oidc exchanges the code (PKCE verifier from sessionStorage, its
 * doing not ours) and validates the id_token. We then read the state we sent and send the
 * customer back to the calling application. We never look inside the tokens beyond the standard
 * claims the library has already validated.
 */
@Component({
  selector: 'ks-callback',
  standalone: true,
  imports: [NgIf, RouterModule, MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card ks-callback" aria-live="polite">
      <ng-container *ngIf="!failed; else fail">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="ks-card__lede">Finishing sign in</p>
      </ng-container>
      <ng-template #fail>
        <h1 class="ks-card__title">We could not finish signing you in</h1>
        <p class="ks-card__lede">{{ message }}</p>
        <div class="ks-actions"><a mat-flat-button color="primary" routerLink="/">Try again</a></div>
      </ng-template>
    </section>
  `,
  styles: [`.ks-callback { text-align: center; } mat-spinner { margin: 8px auto 16px; }`],
})
export class CallbackComponent implements OnInit {
  failed = false;
  message = '';

  constructor(
    private readonly session: AuthSessionService,
    private readonly stepUp: StepUpService,
    private readonly router: Router,
    private readonly telemetry: AuthTelemetryService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    const url = new URL(window.location.href);
    if (url.searchParams.get('error')) {
      this.fail(url.searchParams.get('error') === 'access_denied' ? 'Sign in was cancelled.' : 'The identity service returned an error.');
      return;
    }
    try {
      const ok = await this.session.completeLogin();
      if (!ok) {
        this.fail('The sign in link was not valid or has expired.');
        return;
      }
    } catch {
      this.fail('The identity service did not respond.');
      return;
    }
    this.telemetry.record('login.completed');
    const { returnTo } = this.stepUp.decodeState(this.session.returnedState());
    if (this.stepUp.isAllowedReturn(returnTo)) {
      window.location.replace(returnTo);
      return;
    }
    void this.router.navigate(['/signed-in']);
  }

  private fail(message: string): void {
    this.failed = true;
    this.message = message;
    this.telemetry.record('login.callback_failed');
    this.cdr.markForCheck();
  }
}
