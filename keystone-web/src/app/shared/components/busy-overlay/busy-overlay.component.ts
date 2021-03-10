import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Full card spinner while we wait on the IdP. Legacy progress spinner: the MDC one has a
 * different default diameter and the pixel test for the login page includes this state (KEY-2402).
 * Declared in SharedLegacyModule, not standalone, because everything that uses it is legacy too.
 */
@Component({
  selector: 'ks-busy-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ks-busy" *ngIf="busy" role="status" aria-live="polite">
      <mat-spinner diameter="40" strokeWidth="4" color="primary"></mat-spinner>
      <span class="ks-busy__label">{{ label }}</span>
    </div>
  `,
  styles: [
    `
      :host { display: contents; }
      .ks-busy { align-items: center; background: rgba(255, 255, 255, 0.85); display: flex; flex-direction: column; gap: 12px; inset: 0; justify-content: center; position: absolute; z-index: 2; }
      .ks-busy__label { color: #52606d; font-size: 14px; }
    `,
  ],
})
export class BusyOverlayComponent {
  @Input() busy = false;
  @Input() label = 'One moment';
}
