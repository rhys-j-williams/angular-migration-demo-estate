import { ChangeDetectionStrategy, Component } from '@angular/core';

/** One message in a thread. */
@Component({
  selector: 'mol-message-bubble',
  templateUrl: './message-bubble.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageBubbleComponent {}
