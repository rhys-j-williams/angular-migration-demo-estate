import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MessageRequest, Reply, Turn } from '../models/orchestrator';
import { IRIS_WIDGET_CONFIG, IrisWidgetConfig } from './widget-config';

export const API_PREFIX = '/iris/v1';

/**
 * Thin HTTP client for the orchestrator. No retries on purpose: the orchestrator returns a scripted
 * fallback for anything it does not understand, so a retry only repeats the same answer. Transport
 * failures surface to ChatSessionService, which marks the message failed and lets the customer
 * resend.
 *
 * Headers: Authorization is the customer's Keystone token as supplied by the host (see
 * widget-config.ts). X-Correlation-Id follows the platform convention (PLAT-0781) so a transcript
 * can be joined to the orchestrator log; the orchestrator mints one if we forget, but then support
 * cannot find it from our side. X-Iris-Channel is informational, the orchestrator ignores it today
 * (IRIS-0640 wants it for business vs retail copy).
 */
@Injectable()
export class OrchestratorClientService {
  constructor(private readonly http: HttpClient, @Inject(IRIS_WIDGET_CONFIG) private readonly config: IrisWidgetConfig) {}

  startSession(): Observable<Reply> {
    return this.http.post<Reply>(`${this.base()}/sessions`, {}, { headers: this.headers() });
  }

  sendMessage(sessionId: string, body: MessageRequest): Observable<Reply> {
    return this.http.post<Reply>(`${this.base()}/sessions/${encodeURIComponent(sessionId)}/messages`, body, {
      headers: this.headers(),
    });
  }

  transcript(sessionId: string): Observable<Turn[]> {
    return this.http.get<Turn[]>(`${this.base()}/sessions/${encodeURIComponent(sessionId)}/transcript`, {
      headers: this.headers(),
    });
  }

  private base(): string {
    const url = this.config.orchestratorUrl;
    return (url.endsWith('/') ? url.slice(0, -1) : url) + API_PREFIX;
  }

  private headers(): HttpHeaders {
    let headers = new HttpHeaders({
      'X-Correlation-Id': correlationId(),
      'X-Iris-Channel': this.config.channel,
    });
    if (this.config.bearerToken) {
      headers = headers.set('Authorization', `Bearer ${this.config.bearerToken}`);
    }
    return headers;
  }
}

export function correlationId(): string {
  const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  // Older WebViews in the mobile app shell (IRIS-0520). Not cryptographic, does not need to be.
  return 'iris-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
