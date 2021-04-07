import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { EntitlementsService } from '../entitlements/entitlements.service';

/**
 * Stops the chunk for an entitlement-gated feature from being downloaded at all when the customer
 * cannot use it. Different from AuthGuard (which decides on the route) and FeatureFlagGuard (which
 * decides on a flag): this one decides on the product entitlement the BFF returns at login, and is
 * only worth the extra guard on the big modules - transfers, bill pay and cards - where the chunk is
 * several hundred KB and a savings-only customer would never need it.
 *
 *   { path: 'transfers', canLoad: [LazyModuleGuard], data: { entitlement: 'transfers' }, loadChildren: ... }
 *
 * Entitlements not loaded yet -> allow, the route level guards will sort it out; the point here is
 * bandwidth, not security.
 */
@Injectable({ providedIn: 'root' })
export class LazyModuleGuard implements CanLoad {
  constructor(
    private readonly auth: AuthService,
    private readonly entitlements: EntitlementsService,
    private readonly router: Router
  ) {}

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    if (!this.auth.isAuthenticated) {
      this.auth.login('/' + segments.map(s => s.path).join('/'));
      return of(false);
    }
    const needed = route.data?.['entitlement'] as string | undefined;
    if (!needed) {
      return of(true);
    }
    return this.entitlements.has$(needed).pipe(
      take(1),
      map(ok => (ok ? true : this.router.parseUrl('/forbidden'))),
      catchError(() => of(true))
    );
  }
}
