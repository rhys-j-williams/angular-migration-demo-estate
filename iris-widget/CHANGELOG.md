# Changelog

Contract-relevant changes only. Everything else is in the git log. Versions are `iris-widget/v*` tags.

## 1.9.4 - 2024-11
- Karma: `zone.js/testing` moved into `test.ts` so the ProxyZone is present (IRIS-0812). No shipped change.
- Harness: `check-mount.js` uses a throwaway Chrome profile; the agents started attaching to a lingering instance.

## 1.9.3 - 2024-09
- `X-Correlation-Id` on every orchestrator call (PLAT-0781 alignment).

## 1.9.2 - 2024-06
- `iris.manifest.json` gains `zoneJsCompatible` and `angular`. Informational until IRIS-0790.

## 1.9.1 - 2024-04 (hotfix)
- Export button did nothing on Safari 14 (IRIS-0733). Object URL revoked too early.

## 1.9.0 - 2024-02
- `bearer-token` cleared by the host now resets the conversation (MOL-4120 request).
- Disclosure notice component; orchestrator `disclosure` rendered verbatim (CMP-0412).

## 1.8.0 - 2023-10
- Handoff banner shows `ticketId`. Wait time removed at Legal's request (IRIS-0698).
- Root component back to `ChangeDetectionStrategy.Default` (IRIS-0522, WebView first-token miss).

## 1.7.0 - 2023-05
- **Breaking for hosts:** `iris.manifest.json` introduced; hosts should read `file` from it rather than
  globbing `main.*.js`. The stable `iris.js` copy is kept.
- Dev shell `index.html` no longer in `dist/` (IRIS-0489).

## 1.6.1 - 2023-03 (hotfix)
- Second chunk emitted by an accidental dynamic import; host had nothing to serve it from. `postbuild.js`
  now fails on more than one bundle (IRIS-0577).

## 1.6.0 - 2023-01
- Canopy 3.7.x. Tokens scoped to `.iris-root`.

## 1.5.0 - 2022-11
- `irisOpen` / `irisClose` events (retail-web analytics).
- Quick replies.

## 1.4.0 - 2022-10
- Transcript export, `.txt` (IRIS-0702).

## 1.3.0 - 2022-09
- Single hashed bundle via ngx-build-plus; `iris.js` stable copy (ADR 0003).

## 1.2.0 - 2022-08
- **Breaking for hosts:** Zone.js no longer bundled. Host must provide it (ADR 0002, IRIS-0402).

## 1.1.0 - 2022-07
- Angular Elements build; `<meridian-iris-widget>` registered (ADR 0001).

## 1.0.0 - 2022-06
- Extracted from retail-web `/help/chat`.
