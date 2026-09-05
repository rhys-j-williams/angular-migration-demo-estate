import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CnToastService } from '@meridian/canopy-ui/overlays';
import { of, throwError } from 'rxjs';

import { ChatMessage } from '../models/chat';
import { Reply } from '../models/orchestrator';
import { ChatSessionService } from './chat-session.service';
import { OrchestratorClientService } from './orchestrator-client.service';

describe('ChatSessionService', () => {
  let service: ChatSessionService;
  let client: jasmine.SpyObj<OrchestratorClientService>;
  let toast: jasmine.SpyObj<CnToastService>;

  const greeting: Reply = {
    sessionId: 'sess-1',
    intent: 'greeting',
    confidence: 1,
    messages: ["Hi, I'm Iris."],
    quickReplies: ['Check my balance', 'Talk to someone'],
    ended: false,
  };

  beforeEach(() => {
    client = jasmine.createSpyObj<OrchestratorClientService>('client', ['startSession', 'sendMessage', 'transcript']);
    toast = jasmine.createSpyObj<CnToastService>('toast', ['success', 'caution', 'error', 'show']);
    TestBed.configureTestingModule({
      providers: [ChatSessionService, { provide: OrchestratorClientService, useValue: client }, { provide: CnToastService, useValue: toast }],
    });
    service = TestBed.inject(ChatSessionService);
  });

  function messages(): ChatMessage[] {
    return service.snapshot;
  }

  it('start() is idempotent and applies the greeting reply', () => {
    client.startSession.and.returnValue(of(greeting));
    service.start();
    service.start();
    expect(client.startSession).toHaveBeenCalledTimes(1);
    expect(service.currentSessionId).toBe('sess-1');
    expect(messages().map((m) => m.role)).toEqual(['assistant']);
    let quick: string[] = [];
    service.quickReplies$.subscribe((q) => (quick = q));
    expect(quick).toEqual(['Check my balance', 'Talk to someone']);
  });

  it('send() pushes the customer turn, then the reply, and clears quick replies while waiting', () => {
    client.startSession.and.returnValue(of(greeting));
    client.sendMessage.and.returnValue(
      of({ ...greeting, intent: 'balance', messages: ['Checking: $1,204.10'], quickReplies: [], data: { available: 1204.1 } }),
    );
    service.start();
    service.send('  what is my balance ');
    expect(client.sendMessage).toHaveBeenCalledWith('sess-1', { text: 'what is my balance' });
    const roles = messages().map((m) => m.role);
    expect(roles).toEqual(['assistant', 'customer', 'assistant']);
    expect(messages()[2].data).toEqual({ available: 1204.1 });
  });

  it('ignores blank input and input before a session exists', () => {
    service.send('   ');
    expect(client.sendMessage).not.toHaveBeenCalled();
    expect(messages().length).toBe(0);
  });

  it('marks the customer turn failed on transport error and can retry it', () => {
    client.startSession.and.returnValue(of(greeting));
    client.sendMessage.and.returnValues(throwError(() => new Error('boom')), of({ ...greeting, messages: ['ok'] }));
    service.start();
    service.send('hello');
    const failed = messages().find((m) => m.failed);
    expect(failed).toBeDefined();
    expect(toast.error).toHaveBeenCalled();

    service.retry(failed!.id);
    expect(messages().some((m) => m.failed)).toBeFalse();
    expect(messages().filter((m) => m.role === 'customer').length).toBe(1);
    expect(messages()[messages().length - 1].text).toBe('ok');
  });

  it('raises the handoff banner and ended state from the reply', () => {
    client.startSession.and.returnValue(of(greeting));
    client.sendMessage.and.returnValue(
      of({ ...greeting, intent: 'human', messages: ['One moment.'], handoff: { queue: 'retail-chat', ticketId: 'HND-000123' }, ended: true }),
    );
    service.start();
    service.send('talk to someone');
    let handoff = { active: false, queue: null as string | null, ticketId: null as string | null };
    let ended = false;
    service.handoff$.subscribe((h) => (handoff = h));
    service.ended$.subscribe((e) => (ended = e));
    expect(handoff).toEqual({ active: true, queue: 'retail-chat', ticketId: 'HND-000123' });
    expect(ended).toBeTrue();
    service.send('anything else');
    expect(client.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('explains a 401 on start as a sign-in problem rather than an outage', () => {
    client.startSession.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    service.start();
    expect(messages()[0].role).toBe('system');
    expect(messages()[0].text).toContain('sign in');
    expect(toast.error).not.toHaveBeenCalled();
  });
});
