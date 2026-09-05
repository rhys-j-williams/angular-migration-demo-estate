import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ks-session-expired',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card" aria-labelledby="ks-se-title">
      <h1 id="ks-se-title" class="ks-card__title">Your session timed out</h1>
      <p class="ks-card__lede">For your security we signed you out after a period of inactivity. Nothing was lost.</p>
      <div class="ks-actions"><a mat-flat-button color="primary" routerLink="/">Sign in</a></div>
    </section>
  `,
})
export class SessionExpiredComponent {}
