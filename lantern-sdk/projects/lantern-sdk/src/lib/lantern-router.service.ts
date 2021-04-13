import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LANTERN_CONFIG, LanternConfig, resolveConfig } from './lantern.config';
import { LanternService } from './lantern.service';

/**
 * Fires a page event on every NavigationEnd. Instantiated eagerly by LanternModule.forRoot so
 * there is nothing for the application to wire up.
 *
 * The page name is the URL path with the query string removed and account / customer ids masked,
 * because URLs went to the vendor unmasked for eight months before GIS-1471 (finding 2). If an
 * application wants friendlier names it should set `data: { lanternPage: '...' }` on the route;
 * we read it off the deepest activated route.
 */
@Injectable()
export class LanternRouterTracker implements OnDestroy {
  private sub: Subscription | null = null;
  private lastUrl: string | null = null;

  constructor(
    private readonly lantern: LanternService,
    @Optional() private readonly router: Router | null,
    @Optional() @Inject(LANTERN_CONFIG) config: LanternConfig | null
  ) {
    const cfg = resolveConfig(config || { writeKey: '' });
    if (cfg.trackRouterEvents && this.router) {
      this.sub = this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => this.onNavigationEnd(e));
    }
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private onNavigationEnd(event: NavigationEnd): void {
    const url = event.urlAfterRedirects || event.url;
    if (url === this.lastUrl) {
      return; // same-url navigations (query param changes) are not page views, LNTN-177
    }
    const referrer = this.lastUrl;
    this.lastUrl = url;
    const routeName = this.routeDataName();
    this.lantern.page(routeName || maskPath(url), {
      path: maskPath(url),
      referrerPath: referrer ? maskPath(referrer) : null,
      routeName: routeName || null
    });
  }

  private routeDataName(): string | undefined {
    if (!this.router) {
      return undefined;
    }
    let route = this.router.routerState.root;
    let name: string | undefined;
    while (route) {
      const data = route.snapshot && route.snapshot.data;
      if (data && typeof data.lanternPage === 'string') {
        name = data.lanternPage;
      }
      if (!route.firstChild) {
        break;
      }
      route = route.firstChild;
    }
    return name;
  }
}

const ID_SEGMENT = /^(CUS|ACC|CRD|PAY|TXN|STM|DOC|LNK)-?[0-9A-Za-z]{4,}$/;
const NUMERIC_SEGMENT = /^[0-9]{6,}$/;

/** Strips the query string and fragment and replaces id-looking path segments with `:id`. */
export function maskPath(url: string): string {
  const path = url.split(/[?#]/)[0];
  return path
    .split('/')
    .map((seg) => (ID_SEGMENT.test(seg) || NUMERIC_SEGMENT.test(seg) ? ':id' : seg))
    .join('/') || '/';
}
