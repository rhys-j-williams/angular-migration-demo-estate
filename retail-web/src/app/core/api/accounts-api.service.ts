import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Account, AccountDetails, Page, Transaction, TransactionQuery } from './models';

@Injectable({ providedIn: 'root' })
export class AccountsApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  list(): Observable<Account[]> {
    // 60s not 300s: balances are the one thing customers refresh for (MOL-2760 follow-up).
    return this.get<Account[]>('/accounts', { cacheSeconds: 60 });
  }

  details(accountId: string): Observable<AccountDetails> {
    return this.get<AccountDetails>(`/accounts/${encodeURIComponent(accountId)}`);
  }

  transactions(query: TransactionQuery): Observable<Page<Transaction>> {
    const { accountId, ...rest } = query;
    return this.get<Page<Transaction>>(`/accounts/${encodeURIComponent(accountId)}/transactions`, {
      params: this.params(rest),
      cacheSeconds: 120
    });
  }

  transaction(accountId: string, transactionId: string): Observable<Transaction> {
    return this.get<Transaction>(`/accounts/${encodeURIComponent(accountId)}/transactions/${encodeURIComponent(transactionId)}`);
  }

  rename(accountId: string, nickname: string): Observable<Account> {
    return this.http.patch<Account>(this.url(`/accounts/${encodeURIComponent(accountId)}`), { nickname });
  }

  exportCsv(query: TransactionQuery): Observable<Blob> {
    const { accountId, ...rest } = query;
    return this.http.get(this.url(`/accounts/${encodeURIComponent(accountId)}/transactions.csv`), {
      params: this.params(rest),
      responseType: 'blob'
    });
  }

  openDispute(accountId: string, transactionId: string, reason: string, detail: string): Observable<{ disputeId: string }> {
    return this.http.post<{ disputeId: string }>(
      this.url(`/accounts/${encodeURIComponent(accountId)}/transactions/${encodeURIComponent(transactionId)}/disputes`),
      { reason, detail }
    );
  }
}
