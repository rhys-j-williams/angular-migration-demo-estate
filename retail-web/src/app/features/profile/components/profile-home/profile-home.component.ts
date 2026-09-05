import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { SecuritySettings } from '../../../../core/api/models';
import { selectProfile } from '../../../../core/store/session';

export interface SecurityPosture {
  score: 0 | 1 | 2 | 3;
  passwordAgeDays: number;
  mfaMethod: SecuritySettings['mfaMethod'];
  deviceCount: number;
  recentFailures: number;
}

/** Overview with contact summary and security posture. */
@Component({
  selector: 'mol-profile-home',
  templateUrl: './profile-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileHomeComponent implements OnInit {
  readonly profile$ = this.store.select(selectProfile);
  posture$!: Observable<SecurityPosture | null>;

  constructor(private readonly store: Store, private readonly api: ProfileApiService) {}

  ngOnInit(): void {
    this.posture$ = this.api.security().pipe(map(s => ProfileHomeComponent.posture(s)), catchError(() => of(null)));
  }

  static posture(s: SecuritySettings, now: Date = new Date()): SecurityPosture {
    const passwordAgeDays = Math.floor((now.getTime() - new Date(s.passwordChangedAt).getTime()) / 86_400_000);
    const recentFailures = s.loginHistory.filter(l => l.outcome === 'failed').length;
    let score = 3;
    if (s.mfaMethod === 'sms') score -= 1; // SIM swap risk; Security want everyone on authenticator or push
    if (passwordAgeDays > 365) score -= 1;
    if (recentFailures >= 3) score -= 1;
    return { score: Math.max(0, score) as SecurityPosture['score'], passwordAgeDays, mfaMethod: s.mfaMethod, deviceCount: s.trustedDevices.length, recentFailures };
  }

  postureTone(p: SecurityPosture): 'success' | 'caution' | 'warn' {
    return p.score === 3 ? 'success' : p.score === 2 ? 'caution' : 'warn';
  }

  postureLabel(p: SecurityPosture): string {
    return p.score === 3 ? $localize`:@@profile.posture.strong:Strong` : p.score === 2 ? $localize`:@@profile.posture.fair:Could be better` : $localize`:@@profile.posture.weak:Needs attention`;
  }
}
