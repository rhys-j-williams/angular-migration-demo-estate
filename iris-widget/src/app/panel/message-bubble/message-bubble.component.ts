import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { flattenData } from '../../core/transcript-export.service';
import { ChatMessage } from '../../models/chat';

@Component({
  selector: 'iris-message-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="iris-bubble" [ngClass]="'iris-bubble--' + message.role" [class.iris-bubble--failed]="message.failed">
      <span class="iris-bubble__who">{{ who }}</span>
      <p class="iris-bubble__text">{{ message.text }}</p>
      <ul class="iris-bubble__data" *ngIf="dataRows.length">
        <li *ngFor="let row of dataRows">{{ row }}</li>
      </ul>
      <div class="iris-bubble__meta">
        <time [attr.datetime]="message.at.toISOString()">{{ message.at | date: 'shortTime' }}</time>
        <button *ngIf="message.failed" type="button" class="iris-bubble__retry" (click)="retry.emit()">
          <mat-icon svgIcon="cn:alert" aria-hidden="true"></mat-icon> Not sent. Try again
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./message-bubble.component.scss'],
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;
  @Output() retry = new EventEmitter<void>();

  get who(): string {
    return this.message.role === 'customer' ? 'You' : this.message.role === 'assistant' ? 'Iris' : 'Notice';
  }

  get dataRows(): string[] {
    return flattenData(this.message.data);
  }
}
