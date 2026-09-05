# Runbook: embedding the widget in a host page

For host teams. retail-web already does all of this; see their `help-page.component.ts` and
`scripts/vendor-iris.js` before writing your own.

## Prerequisites

- Your page has Zone.js loaded before our bundle runs, at a version compatible with the Angular
  this widget was built on. `iris.manifest.json` says which (`angular`, `zoneJsCompatible`). If
  your page has no Angular, load `assets/vendor/zone.umd.min.js` from our output yourself.
- You can serve static files under `/assets/widgets/` on the same origin as the page.
- You have the customer's Keystone access token available to your page code.
- Your ingress routes `/iris/v1/*` to iris-orchestrator, or you will pass `orchestrator-url`.

## Steps

1. Take `dist/iris-widget/` from the release artefact (Artifactory `cswt-generic/iris-widget/<version>/`).
   Copy the whole directory, not just the bundle: the sprite is in `assets/canopy/`.
2. Serve it at `/assets/widgets/`. The bundle is then at `/assets/widgets/iris.js` (stable) or
   `/assets/widgets/main.<hash>.js` (from the manifest). Prefer the hash if your cache headers on
   `/assets/` are long.
3. Add `<script src="/assets/widgets/iris.js" defer></script>` to the page, or append it from code
   when the page that needs it activates. Do not add it to your Angular `scripts` array.
4. Put `<meridian-iris-widget>` in the DOM with `bearer-token` set once you have a token. The
   attribute list is in the README under "Mount contract".
5. Listen for `irisOpen` / `irisClose` on the element if you want analytics.
6. Check the browser console on first load. `[iris-widget] Zone.js is not present on the page`
   means step one was not done. Nothing else in the console is ours unless it starts with
   `[iris-widget]`.

## Things that go wrong

| Symptom | Cause |
|---|---|
| Element in DOM, nothing renders, no console error | Bundle 404. Check the network tab for `/assets/widgets/iris.js`. |
| `Zone already loaded` | You loaded our `zone.umd.min.js` on a page that already has Angular. Remove it. |
| `[iris-widget] Zone.js is not present` | Our bundle ran before your Angular bundles. Use `defer` and put it after them, or append from code. |
| Icons are empty squares | Sprite not served, or served from a different path. Set `sprite-url`. |
| Launcher hidden | Your cookie banner or footer has z-index over 1200. |
| "Please sign in to chat with Iris" | `bearer-token` missing, empty, or expired (orchestrator returned 401). |
| Panel opens, greeting never arrives, red toast | Orchestrator unreachable from the browser. Check `/iris/v1/sessions` in the network tab; CORS if the URL is cross-origin. |
| Everything worked until the host upgraded Angular | Zone version mismatch. ADR 0002. Rebuild the widget on a compatible Angular. |
