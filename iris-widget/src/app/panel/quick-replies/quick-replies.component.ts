import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/** Suggested next messages from the orchestrator. Tapping one sends its label verbatim. */
@Component({
  selector: 'iris-quick-replies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="iris-quick" *ngIf="replies.length" role="group" aria-label="Suggested replies">
      <button type="button" class="iris-quick__chip" *ngFor="let r of replies" (click)="picked.emit(r)">{{ r }}</button>
    </div>
  `,
  styles: [
    `
      .iris-quick {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cn-space-2);
        padding: var(--cn-space-2) var(--cn-space-3) 0;
      }
      .iris-quick__chip {
        padding: 6px 12px;
        border: 1px solid var(--cn-color-primary);
        border-radius: 16px;
        background: var(--cn-color-surface);
        color: var(--cn-color-primary);
        font-size: 13px;
        cursor: pointer;
      }
      .iris-quick__chip:hover {
        background: var(--cn-color-primary);
        color: var(--cn-color-primary-contrast);
      }
      .iris-quick__chip:focus-visible {
        outline: var(--cn-focus-ring);
      }
    `,
  ],
})
export class QuickRepliesComponent {
  @Input() replies: string[] = [];
  @Output() picked = new EventEmitter<string>();
}
