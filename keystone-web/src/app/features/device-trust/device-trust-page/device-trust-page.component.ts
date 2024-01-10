import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ActivatedRoute } from '@angular/router';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { DeviceTrustService, TrustedDevice } from '../../../core/device/device-trust.service';
import { AuthTelemetryService } from '../../../core/telemetry/auth-telemetry.service';
import { environment } from '../../../../environments/environment';
import { TrustedDeviceSummaryComponent } from '../trusted-device-summary/trusted-device-summary.component';

/** Device enrolment, MDC, standalone, routed. Post-MFA only; the guard on the route checks. */
@Component({
  selector: 'ks-device-trust-page',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, TrustedDeviceSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './device-trust-page.component.html',
})
export class DeviceTrustPageComponent implements OnInit {
  readonly label = new FormControl(defaultLabel(), { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] });
  readonly days = environment.deviceTrustDays;
  busy = false;
  enrolled: TrustedDevice | null = null;
  private next: string | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly devices: DeviceTrustService,
    private readonly session: AuthSessionService,
    private readonly telemetry: AuthTelemetryService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.next = this.route.snapshot.queryParamMap.get('next') ?? undefined;
  }

  enrol(): void {
    if (this.label.invalid || this.busy) {
      this.label.markAsTouched();
      return;
    }
    this.busy = true;
    this.devices.enrol(this.label.value.trim()).subscribe((d) => {
      this.busy = false;
      this.enrolled = d;
      this.telemetry.record('device.enrolled');
      this.cdr.markForCheck();
    });
  }

  skip(): void {
    this.telemetry.record('device.skipped');
    this.session.followIdpRedirect(this.next);
  }

  continue(): void {
    this.session.followIdpRedirect(this.next);
  }
}

function defaultLabel(): string {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) {
    return 'My iPhone';
  }
  if (/Android/.test(ua)) {
    return 'My Android phone';
  }
  if (/Macintosh/.test(ua)) {
    return 'My Mac';
  }
  return 'My computer';
}
