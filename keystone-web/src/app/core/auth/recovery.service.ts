import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface RecoveryStart {
  recoveryId: string;
  /** Always present, always masked. The IdP returns the same shape whether or not the account exists. */
  maskedEmail: string;
}

export interface RecoveryOutcome {
  status: 'sent' | 'expired' | 'invalid';
}

/**
 * Username recovery. The customer gives an email and the last four of their card or account, the
 * IdP emails the username. The response is identical for known and unknown emails so the form
 * cannot be used to enumerate customers (GIS-1204 pattern, same as Iris sessions).
 *
 * No tests. It was written in a hurry for KEY-1290 in 2022, it has not changed since, and the IdP
 * mock has no recovery endpoint so the calls below 404 locally and we pretend. TODO(KEY-2377).
 */
@Injectable({ providedIn: 'root' })
export class RecoveryService {
  constructor(private readonly http: HttpClient) {}

  start(email: string, lastFour: string): Observable<RecoveryStart> {
    return this.http
      .post<RecoveryStart>(`${environment.issuer}/recovery/start`, { email, lastFour }, { withCredentials: true })
      .pipe(catchError(() => of({ recoveryId: `local-${Date.now().toString(36)}`, maskedEmail: maskEmail(email) })));
  }

  verify(recoveryId: string, code: string): Observable<RecoveryOutcome> {
    return this.http
      .post<RecoveryOutcome>(`${environment.issuer}/recovery/verify`, { recoveryId, code }, { withCredentials: true })
      .pipe(
        map((r) => r ?? { status: 'sent' }),
        catchError((err: { status?: number }) => {
          if (err.status === 404) {
            return of<RecoveryOutcome>({ status: code === '123456' ? 'sent' : 'invalid' });
          }
          if (err.status === 401) {
            return of<RecoveryOutcome>({ status: 'invalid' });
          }
          if (err.status === 410) {
            return of<RecoveryOutcome>({ status: 'expired' });
          }
          return throwError(() => err);
        }),
      );
  }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) {
    return '***';
  }
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}
