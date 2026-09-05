import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CnToastService } from '@meridian/canopy-ui/overlays';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { ChatMessage, HandoffState, NO_HANDOFF } from '../models/chat';
import { Reply } from '../models/orchestrator';
import { OrchestratorClientService } from './orchestrator-client.service';

/**
 * Conversation state for one mounted widget. Provided by IrisWidgetComponent, not root, so two
 * widgets on a page do not talk over each other; that happened in the branch locator prototype
 * and was not fun to debug.
 *
 * Deliberately not NgRx. It is a chat box.
 */
@Injectable()
export class ChatSessionService {
  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private readonly quickRepliesSubject = new BehaviorSubject<string[]>([]);
  private readonly typingSubject = new BehaviorSubject<boolean>(false);
  private readonly handoffSubject = new BehaviorSubject<HandoffState>(NO_HANDOFF);
  private readonly endedSubject = new BehaviorSubject<boolean>(false);
  private readonly disclosureSubject = new BehaviorSubject<string | null>(null);

  readonly messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();
  readonly quickReplies$: Observable<string[]> = this.quickRepliesSubject.asObservable();
  readonly typing$: Observable<boolean> = this.typingSubject.asObservable();
  readonly handoff$: Observable<HandoffState> = this.handoffSubject.asObservable();
  readonly ended$: Observable<boolean> = this.endedSubject.asObservable();
  readonly disclosure$: Observable<string | null> = this.disclosureSubject.asObservable();

  private sessionId: string | null = null;
  private startedAt: Date | null = null;
  private seq = 0;

  constructor(private readonly client: OrchestratorClientService, private readonly toast: CnToastService) {}

  get currentSessionId(): string | null {
    return this.sessionId;
  }

  get sessionStartedAt(): Date | null {
    return this.startedAt;
  }

  get snapshot(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  /** Idempotent. The panel calls it on first open, not on mount, so closed widgets cost nothing. */
  start(): void {
    if (this.sessionId || this.typingSubject.value) {
      return;
    }
    this.typingSubject.next(true);
    this.client
      .startSession()
      .pipe(
        tap((reply: Reply) => {
          this.sessionId = reply.sessionId;
          this.startedAt = new Date();
          this.applyReply(reply);
        }),
        catchError((err: unknown) => {
          this.reportStartFailure(err);
          return of(null);
        }),
        finalize(() => this.typingSubject.next(false)),
      )
      .subscribe();
  }

  send(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || !this.sessionId || this.endedSubject.value) {
      return;
    }
    const mine = this.push({ role: 'customer', text: trimmed });
    this.quickRepliesSubject.next([]);
    this.typingSubject.next(true);
    this.client
      .sendMessage(this.sessionId, { text: trimmed })
      .pipe(
        tap((reply: Reply) => this.applyReply(reply)),
        catchError((err: unknown) => {
          console.error('[iris-widget] send failed', err);
          this.markFailed(mine.id);
          this.toast.error("That didn't send", { action: 'Dismiss' });
          return of(null);
        }),
        finalize(() => this.typingSubject.next(false)),
      )
      .subscribe();
  }

  retry(messageId: string): void {
    const failed = this.messagesSubject.value.find((m) => m.id === messageId && m.failed);
    if (!failed) {
      return;
    }
    this.messagesSubject.next(this.messagesSubject.value.filter((m) => m.id !== messageId));
    this.send(failed.text);
  }

  quickReply(label: string): void {
    this.send(label);
  }

  /** Local reset. The orchestrator session is left to expire on its own (30 min, their side). */
  reset(): void {
    this.sessionId = null;
    this.startedAt = null;
    this.seq = 0;
    this.messagesSubject.next([]);
    this.quickRepliesSubject.next([]);
    this.handoffSubject.next(NO_HANDOFF);
    this.endedSubject.next(false);
    this.disclosureSubject.next(null);
  }

  private applyReply(reply: Reply): void {
    const texts = reply.messages ?? [];
    texts.forEach((text, i) =>
      this.push({
        role: 'assistant',
        text,
        // data rides on the last assistant bubble of the turn, which is where the design put it
        data: i === texts.length - 1 ? reply.data : undefined,
      }),
    );
    this.quickRepliesSubject.next(reply.quickReplies ?? []);
    if (reply.disclosure) {
      this.disclosureSubject.next(reply.disclosure);
    }
    if (reply.handoff) {
      this.handoffSubject.next({ active: true, queue: reply.handoff.queue, ticketId: reply.handoff.ticketId });
    }
    if (reply.ended) {
      this.endedSubject.next(true);
    }
  }

  private reportStartFailure(err: unknown): void {
    console.error('[iris-widget] session start failed', err);
    if (err instanceof HttpErrorResponse && err.status === 401) {
      // No or expired Keystone token from the host. Not our bug, usually; the host forgot to set
      // bearer-token after login (MOL-4201, twice).
      this.push({ role: 'system', text: 'Please sign in to chat with Iris.' });
      return;
    }
    this.push({ role: 'system', text: "Iris isn't available right now. You can still reach us on the Contact page." });
    this.toast.error('Iris is unavailable', { action: 'Dismiss' });
  }

  private push(partial: { role: ChatMessage['role']; text: string; data?: unknown }): ChatMessage {
    const message: ChatMessage = {
      id: `m${++this.seq}`,
      role: partial.role,
      text: partial.text,
      at: new Date(),
      data: partial.data,
    };
    this.messagesSubject.next([...this.messagesSubject.value, message]);
    return message;
  }

  private markFailed(id: string): void {
    this.messagesSubject.next(this.messagesSubject.value.map((m) => (m.id === id ? { ...m, failed: true } : m)));
  }
}
