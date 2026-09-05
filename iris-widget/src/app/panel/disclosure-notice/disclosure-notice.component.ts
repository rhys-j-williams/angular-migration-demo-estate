import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Compliance copy attached to an intent (fees, disputes, Reg E). Comes verbatim from the
 * orchestrator; the widget must not paraphrase or truncate it (CMP-0412). Sticky until replaced.
 */
@Component({
  selector: 'iris-disclosure-notice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="iris-disclosure" role="note">
      <mat-icon svgIcon="cn:info" aria-hidden="true"></mat-icon>
      <span>{{ text }}</span>
    </p>
  `,
  styles: [
    `
      .iris-disclosure {
        display: flex;
        gap: var(--cn-space-2);
        margin: 0;
        padding: var(--cn-space-2) var(--cn-space-3);
        background: var(--cn-color-surface-alt);
        border-bottom: 1px solid var(--cn-color-border);
        color: var(--cn-color-text-muted);
        font-size: 12px;
      }
      .iris-disclosure mat-icon {
        flex: none;
        width: 16px;
        height: 16px;
      }
    `,
  ],
})
export class DisclosureNoticeComponent {
  @Input() text = '';
}
