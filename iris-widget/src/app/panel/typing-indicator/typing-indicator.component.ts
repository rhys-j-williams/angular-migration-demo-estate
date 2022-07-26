import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Three dots. Shown while a request is in flight, which for a scripted orchestrator is ~50ms, so
 * there is a minimum display time in CSS (animation-delay) rather than in code. Product asked for
 * it to "feel like typing" (IRIS-0350). It does not; it feels like a spinner shaped like dots.
 */
@Component({
  selector: 'iris-typing-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="iris-typing" role="status" aria-label="Iris is typing">
      <span></span><span></span><span></span>
    </div>
  `,
  styles: [
    `
      .iris-typing {
        display: inline-flex;
        gap: 4px;
        margin: 0 var(--cn-space-3);
        padding: var(--cn-space-2) var(--cn-space-3);
        border-radius: var(--cn-radius-md);
        background: var(--cn-color-surface);
        border: 1px solid var(--cn-color-border);
      }
      .iris-typing span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--cn-color-text-muted);
        animation: iris-bounce 1.2s infinite ease-in-out;
      }
      .iris-typing span:nth-child(2) {
        animation-delay: 0.15s;
      }
      .iris-typing span:nth-child(3) {
        animation-delay: 0.3s;
      }
      @keyframes iris-bounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        40% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }
    `,
  ],
})
export class TypingIndicatorComponent {}
