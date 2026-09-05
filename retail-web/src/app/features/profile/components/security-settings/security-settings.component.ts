import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { SecuritySettings } from '../../../../core/api/models';
import { AuthService } from '../../../../core/auth/auth.service';

/** MFA method, password age, username, devices, login history. Read on stage; keep it tidy. */
@Component({
  selector: 'mol-security-settings',
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent implements OnInit {
  settings$!: Observable<SecuritySettings>;

  constructor(private readonly api: ProfileApiService, private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.settings$ = this.api.security();
  }

  get username(): string {
    return this.auth.claims?.email ?? this.auth.claims?.name ?? '';
  }

  mfaLabel(m: SecuritySettings['mfaMethod']): string {
    switch (m) {
      case 'sms': return $localize`:@@profile.security.mfaSms:Text message code`;
      case 'authenticator': return $localize`:@@profile.security.mfaApp:Authenticator app`;
      case 'push': return $localize`:@@profile.security.mfaPush:Push notification to the Meridian app`;
    }
  }

  lastFailed(s: SecuritySettings): string | null {
    return s.loginHistory.find(l => l.outcome === 'failed')?.at ?? null;
  }

  signOutEverywhere(): void {
    this.auth.logout('user');
  }
}
