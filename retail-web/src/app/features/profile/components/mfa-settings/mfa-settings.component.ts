import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CnRadioOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { SecuritySettings } from '../../../../core/api/models';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfigService } from '../../../../core/config/config.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';

type MfaMethod = SecuritySettings['mfaMethod'];

/**
 * Choose SMS, authenticator or push. Changing the method is itself a sensitive action, so the
 * customer must have stepped up within the last ten minutes; otherwise we bounce through Keystone
 * and come back here.
 */
@Component({
  selector: 'mol-mfa-settings',
  templateUrl: './mfa-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MfaSettingsComponent implements OnInit {
  readonly options: CnRadioOption<MfaMethod>[] = [
    { value: 'push', label: 'Push notification', description: 'Approve sign-ins in the Meridian mobile app. Recommended.' },
    { value: 'authenticator', label: 'Authenticator app', description: 'Six digit codes from an app such as any TOTP authenticator.' },
    { value: 'sms', label: 'Text message', description: 'Codes sent to your mobile. Least secure; vulnerable to SIM swap.' }
  ];
  current: MfaMethod | null = null;
  selected: MfaMethod | null = null;
  enrolledAt: string | null = null;
  busy = false;
  error: AppError | null = null;

  constructor(
    private readonly api: ProfileApiService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api.security().subscribe(s => {
      this.current = s.mfaMethod;
      this.selected = s.mfaMethod;
      this.enrolledAt = s.mfaEnrolledAt;
      this.cdr.markForCheck();
    });
  }

  get changed(): boolean {
    return this.selected !== null && this.selected !== this.current;
  }

  save(): void {
    if (!this.selected || !this.changed || this.busy) return;
    if (!this.auth.hasRecentMfa(this.config.value.transfers.mfaMaxAgeSeconds)) {
      this.auth.stepUp(this.router.url);
      return;
    }
    this.busy = true;
    this.error = null;
    this.api.setMfaMethod(this.selected).subscribe({
      next: s => {
        this.busy = false;
        this.current = s.mfaMethod;
        this.enrolledAt = s.mfaEnrolledAt;
        this.lantern.track('profile.mfa.method_changed', { method: s.mfaMethod });
        this.toast.success($localize`:@@profile.mfa.saved:Two-step verification updated`);
        this.cdr.markForCheck();
      },
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
