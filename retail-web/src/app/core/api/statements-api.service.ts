import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Statement } from './models';

@Injectable({ providedIn: 'root' })
export class StatementsApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  list(accountId?: string, year?: number): Observable<Statement[]> {
    return this.get<Statement[]>('/statements', { params: this.params({ accountId, year }), cacheSeconds: 300 });
  }

  taxDocuments(year: number): Observable<Statement[]> {
    return this.get<Statement[]>('/statements/tax', { params: this.params({ year }), cacheSeconds: 300 });
  }

  download(statementId: string): Observable<Blob> {
    return this.http.get(this.url(`/statements/${encodeURIComponent(statementId)}/pdf`), { responseType: 'blob' });
  }

  setPaperless(accountId: string, paperless: boolean): Observable<{ accountId: string; paperless: boolean }> {
    return this.http.put<{ accountId: string; paperless: boolean }>(this.url(`/accounts/${encodeURIComponent(accountId)}/paperless`), { paperless });
  }
}
