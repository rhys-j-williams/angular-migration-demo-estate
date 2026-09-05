# Build log: keystone-web

Estate construction notes for the Keystone login front end slice. Phase 1, September 2026. Merged
into the root BUILD_LOG.md by the parent session.

Branches:
- `feature/KEY-2172-keystone-web`, 205 commits replayed from `keystone-web/.history/manifest.json`
  (February 2021 to late 2024; Angular 15 work lands early 2024). Ticket key KEY. Team
  identity-platform, gis-appsec on everything auth-related in CODEOWNERS.
- `feature/KEY-2210-mdc-migration`, the stale half-done migration branch. Its build **fails** with
  `NG8001: 'mat-form-field' is not a known element` (also `mat-label`, `mat-error`) because
  `LegacyMaterialModule` had the legacy form-field and input modules removed while the credential
  form template still uses them and nothing imports the MDC replacements. That is the right reason.
- Scratch `spike/KEY-0-keystone-web-wip` is on the remote; delete after integration.

## Environment

- Node 16.20.2, npm 8.19.4. Chrome at `~/.local/bin/google-chrome`, `CHROME_BIN` exported.
- Angular 15.2.10, Material/CDK 15.2.9, TypeScript 4.9.5, RxJS 7.8.0, zone.js 0.12.0,
  angular-oauth2-oidc 15.0.1, Canopy 3.6.1 from the local Verdaccio (published with
  `canopy-ui/scripts/publish-local-versions.sh` once Canopy landed on develop). `@types/node`
  16.18.11 pinned; confirmed the `Disposable` failure without it.
- `.npmrc` in `keystone-web/`: `legacy-peer-deps=true`, `save-exact=true`, Verdaccio registry
  for `@meridian`.

## Verification

- `npm ci`, `npm run lint`, `npm test -- --watch=false` (77 specs, ~43% statements / ~42% lines),
  `npm run build:prod`, `npm run csp:check` (fails on `unsafe-inline` or inline blocks in the
  built index) all pass on `feature/KEY-2172-keystone-web`.
- `scripts/verify-traps.sh T36` PRESENT. `scripts/check-forbidden-strings.sh worktree` PASS.
- Coverage asymmetry as briefed: the OTP input component is thoroughly tested; the recovery flow
  has no specs at all. `docs/runbooks/coverage.md` records the KEY-1877 gate exception at 38.

## T36 (stuck mid-migration)

- Roughly half the ~25 components import `@angular/material/legacy-*` with `MatLegacy*` prefixes,
  the other half the MDC modules. The migrated ones are the small ones and ones touched for other
  reasons; the legacy set includes the credential form (the highest-traffic screen in the bank).
- `src/styles/_theme.scss` includes both `mat.all-legacy-component-themes` and
  `mat.all-component-themes` with the visual-regression comment from an engineer out of time.
- Mixed standalone and NgModule components; one standalone component both imported by a module
  and left in a commented-out `declarations` line with a TODO.
- Every legacy entry point disappears at Angular 17, so this app cannot pass 16 as it stands.

## Security specifics

- angular-oauth2-oidc against `mock-external/keystone-idp-mock` (4400), code flow with PKCE.
- Device fingerprint service hashes a small, enumerated set of `navigator` properties; the fraud
  team's requirements are in `docs/fraud-device-trust-requirements.md` with the ticket reference,
  and the service comments point at it.
- Rate limit banner, CSP without `unsafe-inline` (`scripts/check-csp.js` enforces).
- Password handled only in the credential form posting to the IdP mock. No token minting or
  decoding beyond standard claims via the library.

## Substitutions and workarounds

- `@types/node` 16.18.11 (phase 0 note).
- `.angular/cache` is gitignored but the forbidden-strings hook scans the working tree; delete
  the cache directory before committing if the hook flags it (iris-widget disables the cache
  outright instead).
- Nothing else substituted; all versions in the brief installed as stated. Canopy 3.6.1 was
  installed from the local Verdaccio publish, not vendored.
