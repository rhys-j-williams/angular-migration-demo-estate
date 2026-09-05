import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

/**
 * Keystone redirect target. By the time this renders the APP_INITIALIZER has already exchanged the
 * code (AuthService.initialise), so all that is left is to go where the customer was heading.
 * Keystone errors (`?error=access_denied` when the customer cancels step-up) land on the logged
 * out page with the reason.
 */
@Component({
  selector: 'mol-auth-callback',
  template: `
    <div class="mol-callback" fxLayout="column" fxLayoutAlign="center center" fxLayoutGap="16px">
      <cn-progress [value]="null" label="Signing you in"></cn-progress>
      <p i18n="@@auth.signingIn">Signing you in to Meridian Online…</p>
    </div>
  `,
  styles: [`.mol-callback { min-height: 60vh; }`]
})
export class AuthCallbackComponent implements OnInit {
  constructor(private readonly auth: AuthService, private readonly router: Router, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error) {
      void this.router.navigate(['/logged-out'], { queryParams: { reason: 'step-up-failed' }, replaceUrl: true });
      return;
    }
    if (this.auth.isAuthenticated) {
      void this.router.navigateByUrl(this.auth.consumeReturnUrl(), { replaceUrl: true });
    } else {
      this.auth.login('/dashboard');
    }
  }
}
