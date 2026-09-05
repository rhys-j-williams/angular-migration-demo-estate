import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ks-not-found',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card" aria-labelledby="ks-nf-title">
      <h1 id="ks-nf-title" class="ks-card__title">That page is not here</h1>
      <p class="ks-card__lede">Check the address, or start from sign in.</p>
      <div class="ks-actions"><a mat-flat-button color="primary" routerLink="/">Go to sign in</a></div>
    </section>
  `,
})
export class NotFoundComponent {}
