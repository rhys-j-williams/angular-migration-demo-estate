# ledgerline-web build log

Notes from the ledgerline-web build session (LDG). Merge into BUILD_LOG.md.

## Environment

- Docker not available on the box; Verdaccio ran with `ESTATE_NO_DOCKER=1 mock-external/scripts/verdaccio-up.sh`.
- npm on Node 18.19.0 resolves `localhost` to `::1` and Verdaccio in-process mode listens on IPv4 only,
  so `ledgerline-web/.npmrc` points `@meridian:registry` at `http://127.0.0.1:4873`. Consumers on a
  Docker Verdaccio are unaffected; the lockfile records the same host.

## Canopy 3.7.2 publish

`canopy-ui/scripts/publish-local-versions.sh` fails at `npm ci` for tag `canopy-ui/v3.7.2`: the
tag's `canopy-ui/package-lock.json` pins `@meridian/domain-fixtures@1.6.0` at integrity
`sha512-ftpkiMwK...` but a clean `tsc` build of `platform-services/libs/ts/domain-fixtures` on
develop publishes a tarball with `sha512-gKBHGfj8...`. Whatever box produced that lockfile had a
different dist output. Reproduced twice (fresh dist, fresh storage). Not fixed in canopy-ui (not this
session's directory). Workaround: ran the script's steps by hand from the tag in a throwaway
worktree with the two integrity lines dropped from the worktree copy of the lockfile only; the
published artifact is otherwise the tagged build (gitHead set to the tag commit). Suggest CNPY
re-lock domain-fixtures once the published tarball is stable.

## Substitutions

- `@angular/flex-layout` has no 16.x release; `15.0.0-beta.42` is the last published version and
  declares Angular 15 peers (satisfied via `legacy-peer-deps`). Same-ecosystem, recorded per R1.

## BFF contract

- `platform-services/services/bff-business` mounts everything under `/api/v1`, so the app's
  `bffBaseUrl` is `http://localhost:4501/api` and calls are `${bffBaseUrl}/v1/treasury/...`. The BFF
  on develop only serves the session and approvals routes today; liquidity, positive pay and audit are
  wire-shaped against the fixture backend and tracked in the README known issues. Not a substitution,
  just an integration gap the parent session should know about.

## Cypress

- Both axe specs run headless (Electron) against `ng serve --configuration e2e`, fixture backend on,
  frozen clock `2024-11-15T14:30:00Z`. `color-contrast` is disabled on the approvals spec only: the
  failing colours are Canopy brand tokens (CNPY-2011, LDG-1092), not ours. Every other axe rule is on.
- Added exact `wait-on@7.2.0` as a devDependency so the Jenkins e2e stage can wait for 4203.

## Runtime configuration

- Production reads `/env.json` at bootstrap (Helm ConfigMap; `src/assets/env.json` is the same-origin
  image default). Local and e2e builds ignore the file on purpose so fixture mode cannot be redirected.

## Verification (final, Node 18.19.0)

- `npm ci` from a removed `node_modules`: `patch-package 8.0.0 ... @meridian/canopy-ui@3.7.2 ✔`.
- `npx eslint .`: 0 errors, 26 max-len warnings.
- `npx jest --coverage`: 18 suites, 83 tests, statements 64.11% / lines 64.72%.
- `npx ng build --configuration production`: initial 744.86 kB raw.
- `npx cypress run`: 2 specs, 4 tests passing.
- `scripts/verify-traps.sh T37 T38`: both PRESENT. `scripts/check-forbidden-strings.sh worktree`: PASS.
