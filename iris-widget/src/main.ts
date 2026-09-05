import { enableProdMode, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { IrisWidgetModule } from './app/iris-widget.module';
import { IrisWidgetComponent } from './app/widget/iris-widget.component';
import { environment } from './environments/environment';

/**
 * Entry point for the Iris widget bundle.
 *
 * This is not a normal Angular bootstrap. The module has no bootstrap component; we create the
 * platform, instantiate the module, and register `<meridian-iris-widget>` as a custom element that
 * the host page mounts wherever it likes. retail-web does it on /help (MOL-4120), the marketing
 * site tried and gave up (IRIS-0388, their CMS strips unknown elements).
 *
 * Zone.js. The host page has already loaded Angular and therefore Zone. We must not load a second
 * one, so polyfills.ts is empty and this file checks for the host's Zone rather than importing it.
 * Both bundles share that single Zone instance, which means the zone.js version in our
 * package.json must be one the host's Angular accepts and vice versa. When retail-web upgrades
 * Angular they upgrade zone.js, and we have to follow in the same release train or the widget
 * stops receiving change detection (it does not throw, it just goes quiet). This is T35 in the
 * estate trap list; the widget team's position on it is in README and docs/adr/0002.
 */
const ELEMENT_TAG = 'meridian-iris-widget';

declare const Zone: unknown;

function hostHasZone(): boolean {
  return typeof Zone !== 'undefined';
}

function register(injector: Injector): void {
  if (customElements.get(ELEMENT_TAG)) {
    // Second bundle on the page (host hot reload, or two <script> tags). Do not re-register, the
    // browser throws and takes the host's console with it.
    return;
  }
  const element = createCustomElement(IrisWidgetComponent, { injector });
  customElements.define(ELEMENT_TAG, element);
}

if (environment.production) {
  enableProdMode();
}

if (!hostHasZone()) {
  // Fail loudly rather than boot in a zoneless state and render a widget that never updates.
  // The dev shell and the harness load zone.js before this bundle; retail-web brings its own.
  throw new Error(
    '[iris-widget] Zone.js is not present on the page. The host application must load zone.js before ' +
      '/assets/widgets/iris.js. See iris-widget/README.md, "Zone.js and the host page".',
  );
}

platformBrowserDynamic()
  .bootstrapModule(IrisWidgetModule)
  .then((ref) => register(ref.injector))
  .catch((err: unknown) => {
    console.error('[iris-widget] failed to start', err);
  });
