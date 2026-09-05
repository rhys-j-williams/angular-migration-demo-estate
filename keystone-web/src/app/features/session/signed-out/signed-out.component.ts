import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ks-signed-out',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card" aria-labelledby="ks-so-title">
      <h1 id="ks-so-title" class="ks-card__title">You're signed out</h1>
      <p class="ks-card__lede">Thanks for banking with us. Close this window if you are on a shared computer.</p>
      <div class="ks-actions"><a mat-flat-button color="primary" routerLink="/">Sign in again</a></div>
    </section>
  `,
})
export class SignedOutComponent {}
