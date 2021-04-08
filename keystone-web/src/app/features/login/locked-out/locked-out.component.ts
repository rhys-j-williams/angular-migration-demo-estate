import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Account locked after too many failed passwords. The unlock path is the recovery flow or the
 * contact centre; we do not offer a self service unlock here because Fraud said no (FRD-0201).
 */
@Component({
  selector: 'ks-locked-out',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ks-card" aria-labelledby="ks-locked-title">
      <mat-icon svgIcon="cn:lock" class="ks-locked__icon" aria-hidden="true"></mat-icon>
      <h1 id="ks-locked-title" class="ks-card__title">Your sign in is locked</h1>
      <p class="ks-card__lede">
        For your protection we have locked online access after several unsuccessful attempts. Nothing has changed
        with your accounts.
      </p>
      <p>To unlock, recover your username below and follow the steps, or call us on the number on the back of your card.</p>
      <div class="ks-actions">
        <a mat-raised-button color="primary" routerLink="/recovery">Recover my username</a>
        <a mat-button routerLink="/">Back to sign in</a>
      </div>
    </section>
  `,
  styles: [`.ks-locked__icon { color: #b3261e; height: 40px; width: 40px; margin-bottom: 8px; }`],
})
export class LockedOutComponent {}
