import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { ChatSessionService } from '../../core/chat-session.service';
import { TranscriptExportService } from '../../core/transcript-export.service';

/** The open panel: header, disclosure, message list, typing, handoff, quick replies, composer. */
@Component({
  selector: 'iris-chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanelComponent {
  @Output() closed = new EventEmitter<void>();

  readonly messages$ = this.session.messages$;
  readonly quickReplies$ = this.session.quickReplies$;
  readonly typing$ = this.session.typing$;
  readonly handoff$ = this.session.handoff$;
  readonly ended$ = this.session.ended$;
  readonly disclosure$ = this.session.disclosure$;

  constructor(
    readonly session: ChatSessionService,
    private readonly transcript: TranscriptExportService,
    private readonly toast: CnToastService,
  ) {}

  export(): void {
    const messages = this.session.snapshot;
    if (messages.length === 0) {
      this.toast.caution('Nothing to save yet');
      return;
    }
    const text = this.transcript.render(messages, this.session.sessionStartedAt, this.session.currentSessionId);
    this.transcript.download(text, this.transcript.filenameFor());
    this.toast.success('Transcript saved');
  }

  startOver(): void {
    this.session.reset();
    this.session.start();
  }
}
