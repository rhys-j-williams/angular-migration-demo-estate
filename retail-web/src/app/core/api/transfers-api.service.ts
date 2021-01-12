import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Payee, Transfer, TransferLimits, TransferRequest } from './models';

@Injectable({ providedIn: 'root' })
export class TransfersApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  limits(): Observable<TransferLimits> {
    return this.get<TransferLimits>('/transfers/limits', { cacheSeconds: 60 });
  }

  scheduled(): Observable<Transfer[]> {
    return this.get<Transfer[]>('/transfers', { params: this.params({ status: 'scheduled' }) });
  }

  history(page: number, pageSize = 25): Observable<Transfer[]> {
    return this.get<Transfer[]>('/transfers', { params: this.params({ page, pageSize }) });
  }

  byId(transferId: string): Observable<Transfer> {
    return this.get<Transfer>(`/transfers/${encodeURIComponent(transferId)}`);
  }

  /** POST with Idempotency-Key so a retried submit from a flaky connection cannot pay twice. */
  submit(request: TransferRequest): Observable<Transfer> {
    return this.http.post<Transfer>(this.url('/transfers'), request, {
      headers: { 'Idempotency-Key': request.idempotencyKey }
    });
  }

  cancel(transferId: string): Observable<Transfer> {
    return this.http.post<Transfer>(this.url(`/transfers/${encodeURIComponent(transferId)}/cancel`), {});
  }

  payees(type?: Payee['type']): Observable<Payee[]> {
    return this.get<Payee[]>('/payees', { params: this.params({ type }), cacheSeconds: 300 });
  }

  addPayee(payee: Omit<Payee, 'payeeId' | 'customerId' | 'addedAt' | 'verified'> & { accountNumber: string }): Observable<Payee> {
    return this.http.post<Payee>(this.url('/payees'), payee);
  }

  verifyPayee(payeeId: string, microDepositsMinor: [number, number]): Observable<Payee> {
    return this.http.post<Payee>(this.url(`/payees/${encodeURIComponent(payeeId)}/verify`), { amounts: microDepositsMinor });
  }

  deletePayee(payeeId: string): Observable<void> {
    return this.http.delete<void>(this.url(`/payees/${encodeURIComponent(payeeId)}`));
  }
}
