import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * "Trust this device?" inline prompt. Went standalone + MDC in the first KEY-2210 pass because it
 * was brand new in KEY-2180 and had no legacy styling to lose. LoginModule imports it directly;
 * the commented-out declaration in that module is deliberate, see the TODO there.
 */
@Component({
  selector: 'ks-device-trust-prompt',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="ks-dt-prompt" *ngIf="!dismissed" role="complementary" aria-labelledby="ks-dt-prompt-title">
      <mat-icon svgIcon="cn:check" aria-hidden="true"></mat-icon>
      <div class="ks-dt-prompt__body">
        <strong id="ks-dt-prompt-title">Skip the code next time?</strong>
        <p>Trust this device and we will not ask for a code here for {{ days }} days. Only do this on a device you own.</p>
        <div class="ks-dt-prompt__actions">
          <button mat-flat-button color="primary" type="button" (click)="accepted.emit()">Trust this device</button>
          <button mat-button type="button" (click)="dismiss()">Not now</button>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./device-trust-prompt.component.scss'],
})
export class DeviceTrustPromptComponent {
  @Input() days = 30;
  @Output() readonly accepted = new EventEmitter<void>();
  @Output() readonly declined = new EventEmitter<void>();
  dismissed = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  dismiss(): void {
    this.dismissed = true;
    this.cdr.markForCheck();
    this.declined.emit();
  }
}
