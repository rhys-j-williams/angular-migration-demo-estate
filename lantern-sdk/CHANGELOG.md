# Changelog

DAE keeps this by hand. Ticket keys are LNTN unless stated.

## 2.4.1 - 2024-05-21

- 437: `sessionId()` no longer throws when sessionStorage is disabled by group policy (branch PCs)
- 439: directive falls back to `data-lantern-event` when Canopy wraps the host element (CNPY-1032)
- deps: tslib 2.3.1 declared as a dependency instead of a peer

## 2.4.0 - 2024-03-12

- 402: `reset()` rotates the local analytics session as well as calling the vendor's reset
- 411: `debug` config flag
- 412: `verify:view-engine` release gate
- 419: `appName` / `appVersion` context on every event

## 2.3.2 - 2023-11-02

- 388: refuse to start when writeKey is empty rather than sending anonymous events

## 2.3.1 - 2023-09-14

- revert of 2.3.0's `sessionHeaderUrlPrefixes` default change; it broke business-web's mock server
  (MBZ-1877). Default is back to `[]`, applications must set it.

## 2.3.0 - 2023-09-07

- 351: `sessionHeaderUrlPrefixes` (GIS-1471 finding 6)
- 355: header name configurable
- 361: Ivy output assessed, deferred to the vendor relationship team

## 2.2.0 - 2022-11-15

- 302, 310, 314: route masking for ids and query strings, `lanternPage` route data, element text
  masking in the directive. All GIS-1471.
- 319: `identify` takes the opaque customer id only

## 2.1.0 - 2022-04-05

- 219: throw on a second `forRoot()`
- 224: queue stub installed before the vendor script loads
- 231: `@types/node` pinned to 16.18.11 (TS 4.3 cannot parse newer declarations)

## 2.0.0 - 2021-11-09

- renamed from `lantern-angular` to `@meridian/lantern-sdk`, moved to Angular 12.2.x, Node 14
- vendor script served from the Meridian hosted copy (GIS-1188)

## 1.x

Un-scoped `lantern-angular`, Angular 9 then 10. See the old repo, archived.
