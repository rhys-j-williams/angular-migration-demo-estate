/**
 * Polyfills loaded before the application bundle.
 *
 * Browser support is defined by the digital channels browser matrix (Confluence, "Supported
 * browsers - Meridian Online"), which as of the 2023.06 train is evergreen Chrome/Edge/Firefox/Safari
 * and iOS 14+. IE11 support was withdrawn in MOL-2440 (2022.03 train) and the core-js imports that
 * carried it were removed at the same time. If you find yourself adding them back, talk to the
 * channels product owner first.
 */

/***************************************************************************************************
 * Zone flags. These must run before zone.js itself is imported.
 */
import './zone-flags';

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 *
 * We import the dist path rather than the bare package because the Lantern snippet (loaded via
 * angular.json scripts, before this bundle) patches XMLHttpRequest and the bare import picked up
 * the wrong build under the 2021 CLI. MOL-1870. Revisit when zone.js is bumped.
 */
import 'zone.js/dist/zone';

/***************************************************************************************************
 * $localize runtime. Needed because we call $localize from TypeScript (see core/i18n) as well as
 * from templates; the compile-time inliner only covers the templates.
 */
import '@angular/localize/init';

/***************************************************************************************************
 * APPLICATION IMPORTS
 */
