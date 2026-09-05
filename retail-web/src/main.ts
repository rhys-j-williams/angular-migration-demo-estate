import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  // Coalescing was turned on in MOL-3120 after the dashboard tiles each triggered their own tick
  // on balance refresh. Measured 30-40% fewer change detection passes on the dashboard.
  ngZoneEventCoalescing: true
})
  .catch(err => {
    // Nothing is wired up yet at this point (no ErrorHandler, no Splunk), so the console is all
    // we have. The boot placeholder in index.html stays on screen; ops see this as a blank page
    // report and check the browser console first (runbook "Blank page after deploy").
    console.error('[mol] bootstrap failed', err);
  });
