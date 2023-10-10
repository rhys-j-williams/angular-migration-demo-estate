import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { HandoffState } from '../../models/chat';

/**
 * Shown once the orchestrator has queued the conversation for an agent. The ticket id is the thing
 * the customer needs if they phone instead; everything else is reassurance. No wait time: the
 * orchestrator does not know it and Legal do not want us guessing (IRIS-0698).
 */
@Component({
  selector: 'iris-handoff-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="iris-handoff" role="status">
      <mat-icon svgIcon="cn:user" aria-hidden="true"></mat-icon>
      <div>
        <strong>We're connecting you with a person.</strong>
        <p>
          Your conversation so far has been passed to the {{ handoff.queue || 'support' }} team. Keep this window open, or
          quote reference <code>{{ handoff.ticketId }}</code> if you call us.
        </p>
      </div>
    </aside>
  `,
  styles: [
    `
      .iris-handoff {
        display: flex;
        gap: var(--cn-space-2);
        margin: var(--cn-space-2) var(--cn-space-3) 0;
        padding: var(--cn-space-2) var(--cn-space-3);
        border-left: 3px solid var(--cn-color-info);
        border-radius: var(--cn-radius-sm);
        background: var(--cn-color-surface);
        font-size: 13px;
      }
      .iris-handoff mat-icon {
        flex: none;
        width: 20px;
        height: 20px;
        color: var(--cn-color-info);
      }
      .iris-handoff p {
        margin: 4px 0 0;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
    `,
  ],
})
export class HandoffBannerComponent {
  @Input() handoff!: HandoffState;
}
