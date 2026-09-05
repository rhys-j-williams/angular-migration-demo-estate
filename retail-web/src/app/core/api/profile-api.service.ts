import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Address, Profile, SecuritySettings, TrustedDevice } from './models';

@Injectable({ providedIn: 'root' })
export class ProfileApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  me(): Observable<Profile> {
    return this.get<Profile>('/me', { cacheSeconds: 300 });
  }

  updateContact(change: Partial<Pick<Profile, 'email' | 'mobile' | 'preferredLanguage' | 'paperless'>>): Observable<Profile> {
    return this.http.patch<Profile>(this.url('/me'), change);
  }

  updateAddress(address: Address): Observable<Profile> {
    return this.http.put<Profile>(this.url('/me/address'), address);
  }

  security(): Observable<SecuritySettings> {
    return this.get<SecuritySettings>('/me/security');
  }

  changePassword(current: string, next: string): Observable<void> {
    return this.http.post<void>(this.url('/me/security/password'), { current, next });
  }

  changeUsername(next: string): Observable<void> {
    return this.http.post<void>(this.url('/me/security/username'), { username: next });
  }

  setMfaMethod(method: SecuritySettings['mfaMethod']): Observable<SecuritySettings> {
    return this.http.put<SecuritySettings>(this.url('/me/security/mfa'), { method });
  }

  trustedDevices(): Observable<TrustedDevice[]> {
    return this.get<TrustedDevice[]>('/profile/security/devices');
  }

  removeDevice(deviceId: string): Observable<TrustedDevice[]> {
    return this.http.delete<TrustedDevice[]>(this.url(`/me/security/devices/${encodeURIComponent(deviceId)}`));
  }
}
