/**
 * Intentionally almost empty.
 *
 * DO NOT import 'zone.js' here. The widget is loaded into a page that already has Angular (retail-web),
 * and two copies of Zone.js on one page throw "Zone already loaded" and then break change detection
 * for both applications (IRIS-0402, INC0129917). The host provides Zone; we ride on it.
 *
 * Consequence: our zone.js version in package.json has to stay compatible with the host's. See
 * README "Zone.js and the host page" and T35 in _demo-notes/TRAPS.md.
 *
 * The dev shell (index.html via ng serve) and the harness under scripts/harness load zone.js from
 * a separate script tag for the same reason.
 */
export {};
