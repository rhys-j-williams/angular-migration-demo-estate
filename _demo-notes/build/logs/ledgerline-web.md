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
