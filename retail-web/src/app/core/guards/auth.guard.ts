import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../auth/auth.service';

/**
 * Every customer route sits behind this. If there is no valid Keystone session we kick off the
 * code flow and remember the URL; the guard returns false because the browser is leaving anyway.
 *
 * Registered as canActivateChild on the authenticated shell route so a new feature module cannot
 * forget it (MOL-1733, the rewards page that was public for a day in UAT).
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private readonly auth: AuthService) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(state.url);
  }

  canActivateChild(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(state.url);
  }

  private check(url: string): boolean {
    if (this.auth.isAuthenticated) {
      return true;
    }
    this.auth.login(url);
    return false;
  }
}
