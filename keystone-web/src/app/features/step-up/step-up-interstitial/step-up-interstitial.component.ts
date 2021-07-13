import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { StepUpService } from '../../../core/auth/step-up.service';
import { AuthTelemetryService } from '../../../core/telemetry/auth-telemetry.service';

/**
 * Landing for /step-up?return_to=...&reason=... from a calling application (retail-web before an
 * external payment, ledgerline before a limit change). We explain why, then start a fresh code
 * flow with acr_values=loa2 and prompt=login. The IdP does the actual MFA; we just carry the
 * return URL through OIDC state and send them back in CallbackComponent.
 *
 * Legacy Material. Nobody has touched this since KEY-1712 and nobody wants to.
 */
@Component({
  selector: 'ks-step-up-interstitial',
  templateUrl: './step-up-interstitial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepUpInterstitialComponent implements OnInit {
  returnTo: string | null = null;
  reason: string | null = null;
  bad = false;
  busy = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly stepUp: StepUpService,
    private readonly session: AuthSessionService,
    private readonly telemetry: AuthTelemetryService,
  ) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const rt = q.get('return_to');
    this.reason = q.get('reason');
    if (this.stepUp.isAllowedReturn(rt)) {
      this.returnTo = rt;
    } else {
      this.bad = true;
      this.telemetry.record('stepup.rejected_return');
    }
    this.telemetry.record('stepup.shown');
  }

  proceed(): void {
    if (!this.returnTo || this.busy) {
      return;
    }
    this.busy = true;
    void this.session.startStepUp(this.stepUp.encodeState(this.returnTo, this.reason));
  }

  cancel(): void {
    if (this.returnTo) {
      window.location.assign(this.returnTo);
    }
  }
}
