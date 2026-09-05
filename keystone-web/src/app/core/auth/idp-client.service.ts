import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export type MfaChannel = 'sms' | 'email' | 'push' | 'totp';

export interface CredentialResult {
  outcome: 'mfa_required' | 'invalid_credentials' | 'locked' | 'expired';
  txn: string;
  /** Masked destination for the default OTP channel, e.g. "+1 *** *** 4471". */
  maskedDestination?: string;
}

export interface MfaResult {
  outcome: 'ok' | 'invalid_code' | 'expired';
  txn: string;
}

export interface PushStatus {
  state: 'pending' | 'approved' | 'denied' | 'expired';
}

const FORM = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

/**
 * Direct calls to the Keystone IdP's interactive endpoints. The password only ever passes through
 * `submitCredentials`, straight from the credential form to the IdP over TLS, and is not retained,
 * logged or copied into any observable state (GIS-1490 finding 1). Do not add a password parameter
 * to any other method in this file.
 *
 * Against the real Keystone these endpoints return JSON. The local mock (mock-external/
 * keystone-idp-mock) renders its own HTML and answers with redirects, so we look at status codes
 * and the final URL rather than a body. That is ugly but it means the same build runs against
 * both. KEY-2301 tracks teaching the mock to speak JSON when it sees Accept: application/json.
 */
@Injectable({ providedIn: 'root' })
export class IdpClientService {
  constructor(private readonly http: HttpClient) {}

  submitCredentials(txn: string, username: string, password: string): Observable<CredentialResult> {
    const body = new URLSearchParams({ txn, username, password }).toString();
    return this.http
      .post(`${environment.issuer}/login`, body, { headers: FORM, observe: 'response', responseType: 'text', withCredentials: true })
      .pipe(
        map((res) => this.interpretCredentialResponse(txn, res)),
        catchError((err: { status?: number }) => {
          if (err.status === 401) {
            return of<CredentialResult>({ outcome: 'invalid_credentials', txn });
          }
          if (err.status === 423) {
            return of<CredentialResult>({ outcome: 'locked', txn });
          }
          if (err.status === 400 || err.status === 410) {
            return of<CredentialResult>({ outcome: 'expired', txn });
          }
          return throwError(() => err);
        }),
      );
  }

  submitOtp(txn: string, code: string): Observable<MfaResult> {
    const body = new URLSearchParams({ txn, code }).toString();
    return this.http
      .post(`${environment.issuer}/mfa`, body, { headers: FORM, observe: 'response', responseType: 'text', withCredentials: true })
      .pipe(
        map(() => ({ outcome: 'ok' as const, txn })),
        catchError((err: { status?: number }) => {
          if (err.status === 401) {
            return of<MfaResult>({ outcome: 'invalid_code', txn });
          }
          if (err.status === 400) {
            return of<MfaResult>({ outcome: 'expired', txn });
          }
          return throwError(() => err);
        }),
      );
  }

  /** Same endpoint as submitOtp; the IdP works out which factor from the txn. */
  submitTotp(txn: string, code: string): Observable<MfaResult> {
    return this.submitOtp(txn, code);
  }

  requestOtp(txn: string, channel: 'sms' | 'email'): Observable<void> {
    const body = new URLSearchParams({ txn, channel }).toString();
    return this.http.post(`${environment.issuer}/mfa/send`, body, { headers: FORM, withCredentials: true }).pipe(
      map(() => undefined),
      // The mock has no send endpoint; the code is fixed. Treat 404 as sent so the local flow works.
      catchError((err: { status?: number }) => (err.status === 404 ? of(undefined) : throwError(() => err))),
    );
  }

  pushStatus(txn: string): Observable<PushStatus> {
    return this.http
      .get<PushStatus>(`${environment.issuer}/mfa/push/${encodeURIComponent(txn)}`, { withCredentials: true })
      .pipe(catchError((err: { status?: number }) => (err.status === 404 ? of<PushStatus>({ state: 'pending' }) : throwError(() => err))));
  }

  private interpretCredentialResponse(txn: string, res: HttpResponse<string>): CredentialResult {
    // The IdP answers 303 -> /mfa on success; XHR follows it so we see the MFA page's URL.
    const landed = res.url ?? '';
    if (landed.includes('/mfa')) {
      return { outcome: 'mfa_required', txn, maskedDestination: this.extractMaskedDestination(res.body) };
    }
    if (res.status === 200 && landed.includes('/login')) {
      return { outcome: 'invalid_credentials', txn };
    }
    return { outcome: 'mfa_required', txn };
  }

  private extractMaskedDestination(html: string | null): string | undefined {
    if (!html) {
      return undefined;
    }
    // e.g. "sent to +1 *** *** 4471" - defensive, only used for display.
    const m = /(\+?\d[\d\s*]{6,}\d{4})/.exec(html);
    return m ? m[1].trim() : undefined;
  }
}
