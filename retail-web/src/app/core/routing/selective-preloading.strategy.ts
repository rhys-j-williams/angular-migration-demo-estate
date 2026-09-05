import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Preloads only the lazy modules that say so:
 *
 *   { path: 'accounts', loadChildren: ..., data: { preload: true, preloadDelayMs: 2000 } }
 *
 * The dashboard is the landing page for 90% of sessions and almost everyone goes to accounts or
 * transfers next, so those two are preloaded a couple of seconds after the shell settles. Nothing
 * else is: bill pay, cards and statements are big and used by a minority of sessions
 * (Lantern funnel report, Q3 2022). Respects Save-Data and skips preloading entirely on 2g/3g.
 *
 * Angular 14's PreloadAllModules would fetch ~1.4MB up front; measured LCP regression on the
 * dashboard was 600ms on the median device (MOL-2971), which is why this exists.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  readonly preloaded: string[] = [];

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!route.data?.['preload'] || this.constrainedNetwork()) {
      return of(null);
    }
    const delay = typeof route.data['preloadDelayMs'] === 'number' ? (route.data['preloadDelayMs'] as number) : 1500;
    return timer(delay).pipe(
      mergeMap(() => {
        this.preloaded.push(route.path ?? '');
        return load();
      })
    );
  }

  private constrainedNetwork(): boolean {
    const nav = navigator as Navigator & { connection?: NetworkInformationLike };
    const conn = nav.connection;
    if (!conn) {
      return false;
    }
    return conn.saveData === true || /(^|-)2g$|^3g$/.test(conn.effectiveType ?? '');
  }
}
