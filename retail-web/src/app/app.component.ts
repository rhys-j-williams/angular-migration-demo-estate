import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { LocaleService } from './core/i18n/locale.service';
import { WebVitalsReporter } from './core/telemetry/web-vitals.reporter';

/**
 * Root. Deliberately thin: the authenticated layout is ShellComponent so public routes (auth
 * callback, onboarding, disclosures) do not get the nav.
 */
@Component({
  selector: 'mol-root',
  template: `
    <mol-sw-update-banner></mol-sw-update-banner>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly locale: LocaleService,
    private readonly vitals: WebVitalsReporter
  ) {}

  ngOnInit(): void {
    this.locale.initialise();
    this.vitals.start();
    this.sub = this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.deepestTitle())
      )
      .subscribe(t => this.title.setTitle(t ? `${t} - Meridian Online` : 'Meridian Online'));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** The UnsavedChangesGuard covers in-app navigation; this covers the tab close. */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (document.querySelector('form.ng-dirty')) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  private deepestTitle(): string | null {
    let r = this.route.snapshot;
    let title: string | null = null;
    while (r) {
      if (r.data['title']) title = r.data['title'] as string;
      if (!r.firstChild) break;
      r = r.firstChild;
    }
    return title;
  }
}
