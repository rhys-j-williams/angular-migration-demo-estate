import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { SecureMessage, SecureMessageThread } from './models';

@Injectable({ providedIn: 'root' })
export class MessagesApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  threads(): Observable<SecureMessageThread[]> {
    return this.get<SecureMessageThread[]>('/messages/threads');
  }

  messages(threadId: string): Observable<SecureMessage[]> {
    return this.get<SecureMessage[]>(`/messages/threads/${encodeURIComponent(threadId)}`);
  }

  compose(topic: string, subject: string, body: string): Observable<SecureMessageThread> {
    return this.http.post<SecureMessageThread>(this.url('/messages/threads'), { topic, subject, body });
  }

  reply(threadId: string, body: string): Observable<SecureMessage> {
    return this.http.post<SecureMessage>(this.url(`/messages/threads/${encodeURIComponent(threadId)}`), { body });
  }

  unreadCount(): Observable<{ unread: number }> {
    return this.get<{ unread: number }>('/messages/unread', { cacheSeconds: 60 });
  }
}
