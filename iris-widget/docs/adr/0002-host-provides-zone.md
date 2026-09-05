# ADR 0002: The host page provides Zone.js; the widget does not bundle it

Status: accepted, 2022-08-03, after IRIS-0402. Digital Assistant squad. Reviewed by
cswt-architecture and retail-digital (host owners).

## Context

The first runtime load of the Elements bundle into retail-web threw

    Error: Zone already loaded.

at boot. Both bundles had `import 'zone.js'` in their polyfills. Zone.js patches the global
environment once and refuses to do it twice, so whichever bundle runs second dies. In the dev
shell it was fine because there the widget was the only Angular on the page.

Ways out that were considered:

1. Host provides Zone, widget does not bundle it. Widget checks for `window.Zone` at boot.
2. Widget bundles Zone and skips the import if `window.Zone` exists. Same thing as 1 with an extra
   170 KB in the bundle for the case where the host has no Angular.
3. Zoneless widget (`ngZone: 'noop'`) with manual change detection. Angular 14 supports it but
   every third-party component we use (Material, Canopy) assumes a Zone, and `async` pipe stops
   working. Prototype in IRIS-0409 was abandoned after two days.
4. Isolate with an iframe. Rejected in ADR 0001 and nothing had changed.

## Decision

Option 1. `polyfills.ts` is empty. `main.ts` throws a readable error if `Zone` is undefined.
The Zone UMD is copied to `assets/vendor/` in the build for the one host (the old marketing pages)
that had no Angular and needed to load it themselves; retail-web ignores it.

## Consequences

This is the important part.

- **The widget's Angular version and the host's Zone.js version are coupled at runtime.** Angular
  expects a Zone at or above a minimum version and there is no negotiation; an incompatible Zone
  fails at boot in the customer's browser. When the host upgrades Angular, its Zone.js moves,
  and the widget must be rebuilt on a compatible Angular and tested against that Zone **before**
  the host deploys. The README says this in bold. The manifest carries `zoneJsCompatible` so a
  build-time check is possible (IRIS-0790), but as of this writing nobody has wired one in.
- The widget cannot upgrade Angular ahead of the host either, if the newer Angular needs a newer
  Zone than the host ships. So the two move together or not at all. In 2022 that seemed like an
  acceptable coordination cost between two squads in the same tribe. The squads have since been
  reorganised twice.
- Karma and the dev shell load Zone themselves (`test-polyfills.ts`, `index.html`), because there
  the widget is the host. This is the source of the recurring "why is polyfills.ts empty, I fixed
  it" pull request. It is not broken. Read the comment in the file.
- If Angular's zoneless mode becomes stable, revisit. That would remove the coupling entirely and
  would be the right time to also remove the `Default` change detection on the root component
  (IRIS-0522).

## Retrospective note, 2024-02

The coupling has not bitten yet because neither retail-web nor the widget has moved Angular majors
since. Both are on 14. The retail-web team have started talking about 15+. When that happens this
ADR is the thing to read first, and IRIS-0790 is the thing to do first.
