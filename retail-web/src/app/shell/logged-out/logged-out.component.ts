import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { LogoutReason } from '../../core/auth/session-claims.model';

@Component({
  selector: 'mol-logged-out',
  template: `
    <div class="mol-logged-out" fxLayout="column" fxLayoutAlign="center center">
      <cn-card [title]="heading" [padded]="true" class="mol-logged-out__card">
        <p>{{ body }}</p>
        <p class="mol-logged-out__hint" *ngIf="reason === 'idle'" i18n="@@loggedOut.idleHint">
          Nothing has changed on your accounts. Any transfer you had not confirmed was not sent.
        </p>
        <div cnCardFooter fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="8px">
          <cn-button variant="primary" (pressed)="signIn()" i18n="@@loggedOut.signIn">Sign in again</cn-button>
          <cn-button variant="tertiary" routerLink="/help" i18n="@@loggedOut.help">Help</cn-button>
        </div>
      </cn-card>
    </div>
  `,
  styles: [`
    .mol-logged-out { min-height: 70vh; padding: 24px; }
    .mol-logged-out__card { max-width: 520px; width: 100%; }
    .mol-logged-out__hint { color: var(--cn-color-text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoggedOutComponent {
  readonly reason: LogoutReason;

  constructor(route: ActivatedRoute, private readonly auth: AuthService) {
    this.reason = (route.snapshot.queryParamMap.get('reason') as LogoutReason | null) ?? 'user';
  }

  get heading(): string {
    switch (this.reason) {
      case 'idle': return $localize`:@@loggedOut.idle.title:You were signed out`;
      case 'token-expired':
      case 'server-401': return $localize`:@@loggedOut.expired.title:Your session ended`;
      case 'step-up-failed': return $localize`:@@loggedOut.stepUp.title:Verification was not completed`;
      default: return $localize`:@@loggedOut.user.title:You have signed out`;
    }
  }

  get body(): string {
    switch (this.reason) {
      case 'idle': return $localize`:@@loggedOut.idle.body:We signed you out after 10 minutes without activity, to keep your accounts safe.`;
      case 'token-expired':
      case 'server-401': return $localize`:@@loggedOut.expired.body:Your sign-in expired. Sign in again to carry on where you left off.`;
      case 'step-up-failed': return $localize`:@@loggedOut.stepUp.body:We could not verify it was you, so the transfer was not made. Sign in again to try again.`;
      default: return $localize`:@@loggedOut.user.body:Thanks for banking with Meridian. Close this window when you are done.`;
    }
  }

  signIn(): void {
    this.auth.login('/dashboard');
  }
}
