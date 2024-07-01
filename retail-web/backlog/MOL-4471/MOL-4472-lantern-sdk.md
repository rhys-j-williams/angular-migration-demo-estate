# MOL-4472 Lantern SDK: Ivy build or replacement

Parent: MOL-4471. Owner: Femi Adeyemi (DAE) with retail-digital.

`@meridian/lantern-sdk` 2.4.1 is the vendor's Angular wrapper, shipped View Engine, and we run
`ngcc` at `postinstall` to use it. Angular 16 removes `ngcc`. Without an Ivy build the framework
upgrade stops at 15.

Options:
- Vendor Ivy build. LNTN-140 open since 2022-05. Vendor says H2 (no year). DAE chasing.
- Wrap the vendor's plain JS snippet ourselves. `lantern.min.js` is loaded from the collector
  host already; the SDK adds the `LanternService`, the router-events auto-page-view and the
  consent gate. About 300 lines to re-implement. DAE would rather not own it.
- Replace the vendor. Procurement, data privacy review, tag migration. Six months minimum.

Acceptance:
- `postinstall` no longer runs `ngcc`.
- `LanternModule.forRoot(...)` replaced or provided by an Ivy-compiled package.
- Page views, `track()` and consent gating still land in the collector; verified against the
  mock on 4607 and in UAT against the real one.

Notes: the `disabled` flag in `env.json` is honoured by our `LanternService` wrapper, not by the
SDK, so a replacement needs to keep that behaviour or the test environments start sending events.
