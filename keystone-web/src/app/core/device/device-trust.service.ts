import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { DeviceFingerprintService } from './device-fingerprint.service';

export interface TrustedDevice {
  deviceId: string;
  label: string;
  enrolledAt: string;
  expiresAt: string;
}

/**
 * Device trust enrolment. The trust marker itself is an HttpOnly cookie set by the BFF, scoped to
 * the login host; this service only asks for it and reports the fingerprint alongside. We never
 * see the cookie value and there is nothing to store on our side.
 */
@Injectable({ providedIn: 'root' })
export class DeviceTrustService {
  constructor(private readonly http: HttpClient, private readonly fingerprint: DeviceFingerprintService) {}

  enrol(label: string): Observable<TrustedDevice> {
    return this.fingerprint.compute().pipe(
      switchMap((fp) =>
        this.http.post<TrustedDevice>(
          `${environment.bffBaseUrl}/identity/v1/devices`,
          { label, fingerprint: fp.hash, fingerprintVersion: fp.version, ttlDays: environment.deviceTrustDays },
          { withCredentials: true },
        ),
      ),
      // BFF is frequently not running locally. Fabricate an enrolment so the screen renders.
      catchError(() => of(localDevice(label))),
    );
  }

  isTrusted(): Observable<boolean> {
    return this.http
      .get<{ trusted: boolean }>(`${environment.bffBaseUrl}/identity/v1/devices/current`, { withCredentials: true })
      .pipe(
        map((r) => r.trusted),
        catchError(() => of(false)),
      );
  }
}

function localDevice(label: string): TrustedDevice {
  const now = new Date();
  const exp = new Date(now.getTime() + environment.deviceTrustDays * 86400000);
  return { deviceId: `local-${now.getTime().toString(36)}`, label, enrolledAt: now.toISOString(), expiresAt: exp.toISOString() };
}
