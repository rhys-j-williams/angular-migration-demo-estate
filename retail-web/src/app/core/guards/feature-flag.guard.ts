import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { FeatureFlagService } from '../flags/feature-flag.service';

/**
 * Gates a route on a Semaphore flag named in route data:
 *
 *   { path: 'rewards', canActivate: [FeatureFlagGuard], data: { flag: 'mol.rewards.enabled' } }
 *
 * Off or unknown -> /not-found rather than /forbidden, so a customer who guesses the URL of an
 * unreleased feature learns nothing (product decision, MOL-2604). If Semaphore itself is down the
 * flag service falls back to the last evaluation it saw, then to the env.json toggle of the same
 * name, then to off.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagGuard implements CanActivate {
  constructor(private readonly flags: FeatureFlagService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const flag = route.data['flag'] as string | undefined;
    if (!flag) {
      console.warn('[mol.flags] FeatureFlagGuard used without data.flag on', route.routeConfig?.path);
      return of(true);
    }
    return this.flags.isEnabled$(flag).pipe(
      take(1),
      map(on => (on ? true : this.router.parseUrl('/not-found'))),
      catchError(() => of(this.router.parseUrl('/not-found')))
    );
  }
}
