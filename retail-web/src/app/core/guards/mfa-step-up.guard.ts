import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../config/config.service';
import { LanternService } from '../telemetry/lantern.service';

/**
 * Where the pending transfer amount is read from. Provided by the transfers feature so this guard
 * (which lives in core and has no business knowing the transfers state shape) stays decoupled.
 */
export interface PendingAmountSource {
  pendingAmountMinor$: Observable<number | null>;
}

export const PENDING_AMOUNT_SOURCE_KEY = 'mol.transfers.pendingAmount';

/**
 * MFA step-up for high value transfers.
 *
 * Policy (Payments Risk, PR-2021-014, revised 2023-05): a transfer at or above
 * `transfers.mfaStepUpThresholdMinor` may only be confirmed if the customer completed a second
 * factor within the last `transfers.mfaMaxAgeSeconds` (600 = ten minutes). Below the threshold the
 * ordinary session is enough.
 *
 * The guard sits on the transfer review/confirm route. It reads the pending amount the transfer
 * wizard has parked in sessionStorage (the wizard writes it on every amount change; the store is
 * not used here because a step-up round trip through Keystone reloads the app and the store with
 * it - MOL-3812). If the claim is missing or too old we redirect to Keystone with acr_values for
 * loa2 and a return URL back to the review step. Keystone comes back to /auth/callback, which
 * navigates to the return URL, and the guard runs again with a fresh mfa_at.
 *
 * Route data can override the threshold for a specific flow: `data: { mfaThresholdMinor: 0 }`
 * forces step-up regardless of amount (used by the external payee add flow, MOL-3990).
 */
@Injectable({ providedIn: 'root' })
export class MfaStepUpGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly router: Router,
    private readonly lantern: LanternService,
    private readonly store: Store
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (!this.auth.isAuthenticated) {
      // AuthGuard is ahead of us on every route that uses this guard; belt and braces.
      this.auth.login(state.url);
      return of(false);
    }

    const cfg = this.config.value.transfers;
    const threshold = typeof route.data['mfaThresholdMinor'] === 'number'
      ? (route.data['mfaThresholdMinor'] as number)
      : cfg.mfaStepUpThresholdMinor;

    return this.pendingAmount().pipe(
      take(1),
      map(amountMinor => {
        if (amountMinor === null) {
          // No amount in flight means the customer deep linked to the review step. Send them to
          // the start of the wizard rather than to Keystone.
          return this.router.parseUrl(this.wizardStart(state.url));
        }
        if (amountMinor < threshold) {
          return true;
        }
        if (this.auth.hasRecentMfa(cfg.mfaMaxAgeSeconds)) {
          this.lantern.track('transfer.stepup.satisfied', { amountBand: this.band(amountMinor) });
          return true;
        }
        this.lantern.track('transfer.stepup.required', {
          amountBand: this.band(amountMinor),
          mfaAgeSeconds: this.auth.mfaAgeSeconds()
        });
        this.auth.stepUp(state.url);
        return false;
      })
    );
  }

  private pendingAmount(): Observable<number | null> {
    const raw = sessionStorage.getItem(PENDING_AMOUNT_SOURCE_KEY);
    if (raw === null || raw === '') {
      return of(null);
    }
    const parsed = Number(raw);
    return of(Number.isFinite(parsed) ? parsed : null);
  }

  private wizardStart(url: string): string {
    // /transfers/new/review -> /transfers/new ; /transfers/external/review -> /transfers/external
    return url.replace(/\/(review|confirm)(\?.*)?$/, '');
  }

  /** Amount bands for analytics; never the amount itself (GIS-1471 finding 6). */
  private band(minor: number): string {
    const major = minor / 100;
    if (major < 500) return 'lt500';
    if (major < 2500) return '500-2500';
    if (major < 10000) return '2500-10000';
    return 'gte10000';
  }
}
