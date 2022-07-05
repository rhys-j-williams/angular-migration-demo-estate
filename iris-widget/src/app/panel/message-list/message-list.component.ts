import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ChatMessage } from '../../models/chat';

@Component({
  selector: 'iris-message-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #scroller class="iris-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
      <iris-message-bubble
        *ngFor="let m of messages; trackBy: trackById"
        [message]="m"
        (retry)="retry.emit(m.id)"></iris-message-bubble>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        overflow: hidden;
      }
      .iris-messages {
        height: 100%;
        overflow-y: auto;
        padding: var(--cn-space-3);
        display: flex;
        flex-direction: column;
        gap: var(--cn-space-2);
        background: var(--cn-color-surface-alt);
      }
    `,
  ],
})
export class MessageListComponent implements AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @Output() retry = new EventEmitter<string>();

  @ViewChild('scroller') private scroller?: ElementRef<HTMLDivElement>;
  private lastCount = 0;

  trackById(_index: number, m: ChatMessage): string {
    return m.id;
  }

  ngAfterViewChecked(): void {
    // Scroll to the newest message only when one was added, so a customer reading history is not
    // yanked to the bottom by an unrelated change detection pass (IRIS-0471).
    if (this.messages.length !== this.lastCount && this.scroller) {
      this.lastCount = this.messages.length;
      const el = this.scroller.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
