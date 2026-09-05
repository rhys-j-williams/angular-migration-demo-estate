import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AuthSessionService } from '../../../core/auth/auth-session.service';

/**
 * Where you land if you signed in at login.* directly with no calling application. Real
 * customers rarely see it; support staff testing credentials see it constantly.
 */
@Component({
  selector: 'ks-signed-in',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card" aria-labelledby="ks-si-title">
      <h1 id="ks-si-title" class="ks-card__title">You're signed in</h1>
      <p class="ks-card__lede" *ngIf="claims$ | async as c">Welcome back{{ c.given_name ? ', ' + c.given_name : '' }}.</p>
      <p>Choose where to go:</p>
      <div class="ks-actions">
        <a mat-flat-button color="primary" href="https://www.meridiantrust.example/online-banking">Personal banking</a>
        <a mat-stroked-button href="https://business.meridiantrust.example">Business banking</a>
        <button mat-button type="button" (click)="signOut()">Sign out</button>
      </div>
    </section>
  `,
})
export class SignedInComponent {
  readonly claims$ = this.session.claims;

  constructor(private readonly session: AuthSessionService) {}

  signOut(): void {
    this.session.logout();
  }
}
