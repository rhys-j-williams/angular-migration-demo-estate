import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { IdleTimeoutService } from '../../core/session/idle-timeout.service';
import { sessionActions } from '../../core/store/session/session.actions';
import { selectIdleWarningSeconds } from '../../core/store/session/session.reducer';

/**
 * "Are you still there?" Opened by ShellComponent when the idle service enters warning. Copy was
 * reviewed by Legal for the ISS-14 wording ("for your security") in MOL-4412.
 */
@Component({
  selector: 'mol-idle-warning-dialog',
  template: `
    <cn-dialog-shell [title]="title" [showClose]="false">
      <p i18n="@@idle.body">For your security we sign you out after 10 minutes without activity.</p>
      <p class="mol-idle__countdown" role="timer" aria-live="polite" i18n="@@idle.countdown">
        You will be signed out in {{ (seconds$ | async) ?? 0 }} seconds.
      </p>
      <div cnDialogActions fxLayout="row" fxLayoutGap="8px" fxLayoutAlign="end">
        <cn-button variant="tertiary" (pressed)="signOut()" i18n="@@idle.signOut">Sign out now</cn-button>
        <cn-button variant="primary" (pressed)="stay()" molAutofocus i18n="@@idle.stay">I'm still here</cn-button>
      </div>
    </cn-dialog-shell>
  `,
  styles: [`.mol-idle__countdown { font-weight: 500; font-variant-numeric: tabular-nums; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdleWarningDialogComponent {
  readonly title = $localize`:@@idle.title:Are you still there?`;
  readonly seconds$ = this.store.select(selectIdleWarningSeconds);

  constructor(
    private readonly ref: MatDialogRef<IdleWarningDialogComponent>,
    private readonly store: Store,
    private readonly idle: IdleTimeoutService
  ) {}

  stay(): void {
    this.idle.extend();
    this.ref.close();
  }

  signOut(): void {
    this.ref.close();
    this.store.dispatch(sessionActions.logout({ reason: 'user' }));
  }
}
