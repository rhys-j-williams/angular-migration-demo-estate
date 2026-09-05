import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { RecoveryStateService } from '../recovery-state.service';

@Component({
  selector: 'ks-recovery-done',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card" aria-labelledby="ks-recd-title">
      <mat-icon svgIcon="cn:check" class="ks-recd__icon" aria-hidden="true"></mat-icon>
      <h1 id="ks-recd-title" class="ks-card__title">We've emailed your username</h1>
      <p class="ks-card__lede">
        If the details matched a profile, your username is on its way. It can take a few minutes. Check your junk folder if
        it does not arrive.
      </p>
      <div class="ks-actions">
        <a mat-flat-button color="primary" routerLink="/">Back to sign in</a>
      </div>
    </section>
  `,
  styles: [`.ks-recd__icon { color: #1e7f4f; height: 40px; width: 40px; margin-bottom: 8px; }`],
})
export class RecoveryDoneComponent implements OnInit {
  constructor(private readonly state: RecoveryStateService) {}

  ngOnInit(): void {
    this.state.clear();
  }
}
