import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Bill, BillPayment } from './models';

@Injectable({ providedIn: 'root' })
export class BillPayApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  bills(): Observable<Bill[]> {
    return this.get<Bill[]>('/bill-pay/bills', { cacheSeconds: 120 });
  }

  payments(status?: BillPayment['status']): Observable<BillPayment[]> {
    return this.get<BillPayment[]>('/bill-pay/payments', { params: this.params({ status }) });
  }

  schedule(payment: Omit<BillPayment, 'paymentId' | 'status' | 'confirmationNumber' | 'deliverBy'> & { idempotencyKey: string }): Observable<BillPayment> {
    return this.http.post<BillPayment>(this.url('/bill-pay/payments'), payment, {
      headers: { 'Idempotency-Key': payment.idempotencyKey }
    });
  }

  cancel(paymentId: string): Observable<BillPayment> {
    return this.http.post<BillPayment>(this.url(`/bill-pay/payments/${encodeURIComponent(paymentId)}/cancel`), {});
  }

  setAutopay(payeeId: string, enabled: boolean, fromAccountId?: string): Observable<Bill> {
    return this.http.put<Bill>(this.url(`/bill-pay/payees/${encodeURIComponent(payeeId)}/autopay`), { enabled, fromAccountId });
  }

  enrollEbill(payeeId: string): Observable<Bill> {
    return this.http.post<Bill>(this.url(`/bill-pay/payees/${encodeURIComponent(payeeId)}/ebill`), {});
  }
}
