import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { AlertHistoryItem, AlertPreference } from './models';

@Injectable({ providedIn: 'root' })
export class AlertsApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  preferences(): Observable<AlertPreference[]> {
    return this.get<AlertPreference[]>('/alerts/preferences');
  }

  updatePreference(alertId: string, change: Partial<Pick<AlertPreference, 'enabled' | 'channels' | 'thresholdMinor' | 'quietHours'>>): Observable<AlertPreference> {
    return this.http.patch<AlertPreference>(this.url(`/alerts/preferences/${encodeURIComponent(alertId)}`), change);
  }

  history(page = 1, pageSize = 50): Observable<AlertHistoryItem[]> {
    return this.get<AlertHistoryItem[]>('/alerts/history', { params: this.params({ page, pageSize }) });
  }

  markRead(ids: string[]): Observable<void> {
    return this.http.post<void>(this.url('/alerts/history/read'), { ids });
  }

  sendTest(channel: AlertPreference['channels'][number]): Observable<void> {
    return this.http.post<void>(this.url('/alerts/test'), { channel });
  }
}
