---
name: northgate-local-screenshot-capture
description: Prepare the Northgate local estate and recapture its six frontend screenshot galleries.
---

# Local gallery capture

Use the workspace's `docs/SCREENSHOTS.md` for filenames and `PORTS.md` for ports.
The documented gallery uses local mock/fixture data, not production or UAT.
Preserve filenames and use Playwright viewport 1440x900, deviceScaleFactor 1,
PNG, fullPage false. Inspect screenshots, not only DOM text.

## Estate setup

- Respect each repository's `.nvmrc`: Business and Lantern use Node 14.21.3;
  most Angular 14/15 apps use Node 16.20.2; mocks/platform use Node 18.19.0.
- Estate scripts expect sibling `northgate-*` directories. If clones retain old
  names, use symlinks or the scripts' workspace/repository environment overrides.
- Start Verdaccio/mocks using mock-external's `estate-up.sh`, typically with
  `ESTATE_NO_DOCKER=1` and selected services from `ESTATE_SERVICES`.
- Use Canopy's historical-tag publisher to publish genuine supported versions;
  never substitute current code under historical versions. Verify package scope
  in dist when repository branding has changed.
- Platform services require built Java jars/Node dist. Java 11 is used for
  Bedrock, Java 17 for entitlements. `scripts/run-local.sh` handles start/stop.
- If Maven Central rate-limits, a temporary settings mirror at
  `https://maven-central.storage-download.googleapis.com/maven2` can resolve builds.
- Business's Node 14 dependency install may require `--engine-strict=false`
  for newer transitive metadata; do not change package manifests for captures.
- Start frontend servers with `npm start -- --host 127.0.0.1`; on small machines,
  capture in batches and stop completed Angular servers to free memory.

## Login and fixtures

- Local Keystone mock users are listed at `http://localhost:4400/debug/users`.
  Demo password is `Passw0rd`, MFA code `123456`.
- Retail redirects to the mock; complete password and MFA through the UI.
- Business/Ledgerline ship fixture-backed administrator/approver sessions.
  Report the actual current organization rather than forcing old reference seeds.
- After seed changes, confirm exported platform fixtures match mock-generated
  account IDs. A renamed JSON seed label alone does not regenerate its contents.
  Request regeneration by the source owner when needed, then restart consumers.
- Preserve the documented Retail BFF/model empty states and missing balances;
  do not invent response fields to make screenshots look more populated.

## Capture-only workarounds

- Keystone dev CSP may block Angular inline component styles. When explicitly
  approved for capture, intercept document responses and remove BOTH the CSP
  meta and `content-security-policy` HTTP header in flight. Never edit production
  CSP or source for this workaround.
- Supply Retail's local Material Icons WOFF2 in `src/assets/fonts/` when needed.
- Iris: build development output, serve dist on 4205, and create the dist-only
  `assets/widgets/assets/canopy` symlink to the built `assets/canopy` directory.
  The launcher accessible label is `Chat with Iris, our virtual assistant`;
  unauthenticated panel captures should show the genuine sign-in notice.
- With Chrome CDP, bring each page to the foreground before taking screenshots;
  background page screenshots may time out even after fonts report loaded.
- Verify all expected files changed, dimensions and PNG format, then inspect
  every view visually and scan visible text for stale branding.

## Devin Secrets Needed

None for the documented local mock/fixture gallery.
