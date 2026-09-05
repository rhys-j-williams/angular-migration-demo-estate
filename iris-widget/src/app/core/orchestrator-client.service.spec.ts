import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Reply } from '../models/orchestrator';
import { OrchestratorClientService } from './orchestrator-client.service';
import { IRIS_WIDGET_CONFIG, IrisWidgetConfig } from './widget-config';

describe('OrchestratorClientService', () => {
  let service: OrchestratorClientService;
  let http: HttpTestingController;
  const config: IrisWidgetConfig = { orchestratorUrl: 'http://localhost:4517/', channel: 'test', bearerToken: 'tok-1' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrchestratorClientService, { provide: IRIS_WIDGET_CONFIG, useValue: { ...config } }],
    });
    service = TestBed.inject(OrchestratorClientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts to /iris/v1/sessions with bearer, channel and correlation headers', () => {
    let got: Reply | undefined;
    service.startSession().subscribe((r) => (got = r));
    const req = http.expectOne('http://localhost:4517/iris/v1/sessions');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-1');
    expect(req.request.headers.get('X-Iris-Channel')).toBe('test');
    expect(req.request.headers.get('X-Correlation-Id')).toBeTruthy();
    req.flush(reply({ sessionId: 's1' }));
    expect(got?.sessionId).toBe('s1');
  });

  it('url-encodes the session id on messages', () => {
    service.sendMessage('a b/c', { text: 'hi' }).subscribe();
    const req = http.expectOne('http://localhost:4517/iris/v1/sessions/a%20b%2Fc/messages');
    expect(req.request.body).toEqual({ text: 'hi' });
    req.flush(reply({}));
  });

  it('omits Authorization when the host has not supplied a token', () => {
    const cfg = TestBed.inject(IRIS_WIDGET_CONFIG);
    cfg.bearerToken = null;
    service.startSession().subscribe();
    const req = http.expectOne('http://localhost:4517/iris/v1/sessions');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(reply({}));
  });
});

function reply(partial: Partial<Reply>): Reply {
  return { sessionId: 's', intent: 'greeting', confidence: 1, messages: [], quickReplies: [], ended: false, ...partial };
}
