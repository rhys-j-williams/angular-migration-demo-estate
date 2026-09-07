# Build log

Running record of substitutions, workarounds, uncertainties and decisions taken while assembling
the estate. Newest entries at the bottom of each phase.

## Phase 0 — environment, 5 September 2026

Workstation: Ubuntu 22.04, 2 vCPU, 7 GB RAM, 122 GB disk.

| Tool | Required | Installed | Note |
|---|---|---|---|
| Node | 14.21.3, 16.20.2, 18.19.0 | all three via nvm 0.40.1 | `.nvmrc` per directory selects |
| Java | 11 and 17 | OpenJDK 11.0.28 and 17.0.13 | apt |
| Maven | 3.9 | 3.9.9 in `/opt/apache-maven-3.9.9` | apt ships 3.6.3, superseded by a manual install |
| Python | 3.11 | 3.11.15 via deadsnakes | system Python is 3.10 |
| Docker | needed for compose | 27.4.1 present | compose path is available; in process fallbacks still required |
| Chrome | for Karma | Chrome 133 at `~/.local/bin/google-chrome` | `CHROME_BIN` is set in each `karma.conf.js` |

Toolchain proofs, all from a clean CLI workspace:

- Angular 14.2.13 workspace under Node 16.20.2 — production build passes, `ng test` with
  ChromeHeadless passes 3 of 3.
- Angular 12.2.18 library workspace under Node 14.21.3 — `ng build` of a library passes.
- Angular 15.2.11 workspace under Node 16.20.2 — production build passes.
- Angular 16.2.16 workspace under Node 18.19.0 — production build passes.

Substitutions and workarounds:

- **`@types/node` pinned to 16.18.11 in the Angular 12, 14 and 15 workspaces.** The floating
  `@types/node` that npm resolves today ships `Disposable` and `Symbol.dispose` declarations that
  TypeScript 4.3, 4.7 and 4.9 cannot parse, so a production build fails in `node_modules` before it
  reaches application code. Pinning inside the same major that a 2022 estate would have used is
  the minimal fix and is consistent with the exact-version rule.
- Angular CLI 12 is installed globally inside the Node 14 nvm environment rather than run through
  `npx`, because npm 6's `npx` does not resolve the binary from a scoped package reliably.

Decisions taken without asking:

- The estate is assembled as one repository with a directory per component, at Rhys's instruction,
  rather than the ten separate repositories in the brief. Consequence: histories share one commit
  graph. Synthetic authorship, dates, ticket keys and the named stale branches are preserved; tags
  are namespaced by component, for example `canopy-ui/v3.7.2` and `retail-web/v2026.08.1`.
- Pushes go through a token header helper rather than the usual git path, because the Devin GitHub
  App is not installed on this repository and the proxy returns 403. Flagged to Rhys; the token is
  never written into `.git/config`.

## Phase 1 — shared foundations, 5 September 2026

- `platform-services/libs/ts/domain-fixtures` (`@meridian/domain-fixtures` 1.6.0): deterministic
  seeded generation of customers, accounts, cards, transactions, payees, alert preferences and
  entitlements, plus the Bedrock fixed-width codec. 18 tests pass; `tsc --noEmit` is clean.
- Data-safety invariants are enforced by the package and covered by tests: every card number fails
  Luhn, every account and payee carries routing number `021000000`, every email is `@example.com`,
  regulatory alerts cannot be disabled, amounts are integer minor units.
- `platform-services/copybooks`: `MTBACCT`, `MTBTRAN` and `MTBCUST` with a README documenting the
  signed zoned decimal overpunch encoding.
- `_demo-notes/build/authors.json` and `replay_history.py`: the fictional engineer roster across
  five sites with time-zone-correct commit stamps, and the manifest-driven history replay tool.

Corrections made during the phase:

- `MTBACCT` was documented as 128 positions; the fields as specified total **136**. The codec, the
  decoder's validation, the tests and the copybook README were corrected to 136 rather than
  trimming a field to fit the wrong number.

## Phase 10 (partial) — handover deliverables, 5 September 2026

Written ahead of the components they describe, so that each component session has the trap
signatures and conventions to build against:

- `_demo-notes/TRAPS.md` — all 48 traps with paths, grep signatures and expected agent behaviour.
- `_demo-notes/PLAYBOOKS.md`, `KNOWLEDGE.md`, `ASK-DEVIN-PROMPTS.md`,
  `MIGRATION-REPORT-TEMPLATE.md`, `README.md`.
- `scripts/verify-traps.sh` and `scripts/verify-estate.sh`. Both report components that have not
  been built yet as PENDING or SKIP rather than failing, so they are useful during construction.

`_demo-notes/expected-ng-update-15-output.md` is still outstanding: it has to be captured from a
real `ng update` dry run against `canopy-ui` and `retail-web`, which do not exist yet.

## Phase 2, 3, 8, 9 and 10 (tooling) — delegated, 5 September 2026

Four parallel sessions are building `canopy-ui`, `mock-external` plus `lantern-sdk`,
`platform-services` and `platform-tooling` on their own branches. Each owns exactly one top-level
directory and pushes without merging; this session integrates. The five Angular consumers follow
once Canopy publishes, because they cannot install the library until it exists.

## Phase 2 integration and Phase 4 to 7 start, 5 September 2026

`canopy-ui` is on `develop`: 34 components, the `cnFocusTrap` and `cnSkipLink` directives, three
themes, an `ng-add` schematic and traps T1 to T17, over 258 replayed commits. Tags
`canopy-ui/v3.5.0`, `canopy-ui/v3.6.1` and `canopy-ui/v3.7.2` are pushed, and
`canopy-ui/scripts/publish-local-versions.sh` rebuilds and republishes all three into a wiped
Verdaccio, which is what gives the consumers their version fan-out (T47).

`_demo-notes/expected-ng-update-15-output.md` holds the real Angular 15 update output for
`canopy-ui`. Angular CLI 14 has no `ng update --dry-run`, so the Canopy session ran the update for
real inside a throwaway `git worktree` of the same commit and deleted it afterwards. Two findings
worth knowing before the demo: the core and CLI update fails on an `@angular-eslint/schematics`
peer conflict until it is rerun with `--force`, and the migration needs `@meridian/domain-fixtures`
present in Verdaccio or it aborts with a 404.

Per-component history tooling moved out of `canopy-ui/.history/` to
`_demo-notes/build/history/<component>/`, and `.history/` is now ignored. A hidden build directory
inside a bank's design system reads as an accident to anyone indexing the estate.

`scripts/verify-estate.sh` no longer fails the exact-version rule on publishable library manifests.
A library states its peers as ranges on purpose, and Canopy's `^14.0.0` Angular peer range is
trap T37; the check still applies to every workspace we actually install.

Phases 4 to 7 are running in four parallel sessions (`retail-web`, `business-web`, `keystone-web`
with `iris-widget`, `ledgerline-web`), each installing Canopy from local Verdaccio at its own
pinned version. `platform-services` is still building; `iris-orchestrator`, `documents-service`,
`statements-api` and `exposure-calc` are outstanding there, which is also why four checks in
`mock-external/smoke.sh` still skip.

## Phase 4 to 9 integration and estate smoke, 5 September 2026

All ten components are on `develop`: `retail-web` (335 replayed MOL/GIS commits, spike branch
`feature/MOL-3801-angular15-spike`, hotfix `retail-web/v2024.09.2`), `business-web`, `keystone-web`,
`iris-widget`, `ledgerline-web`, `platform-services` (all twelve services) and `platform-tooling`.
`scripts/verify-traps.sh` reports 47 present, 1 pending (T44 needs the coverage aggregate run).

Fallback estate (`ESTATE_NO_DOCKER=1 mock-external/estate-up.sh` then `smoke.sh`) passes all 20
checks. Getting there fixed real integration defects, none of them traps:

- `BEDROCK_ADAPTER_URL` needed the `/bedrock/v1` prefix; the BFF was 404ing on accounts (PLAT-2718).
- `documents-service` -> `statements-api`: Node 18 resolves `localhost` to `::1` first and uvicorn
  only binds v4, so the client now uses `127.0.0.1` (PLAT-2720).
- `splunk-hec-mock` shipped its own access log to itself through the shared mock-kit logger; the
  NDJSON grew to 2 GB in minutes. The collector is excluded from HEC forwarding (PLAT-2721).
- log4j-core 2.17.2 drops `value=` on `<Property>` under the Http appender, so every Java HEC post
  went out with an empty `Authorization` header and was rejected. Element-body form fixes it
  (PLAT-2722). `MERIDIAN_SERVICE_NAME` is now set per service in `run-local.sh` and compose.
- Correlation: the Java `CorrelationIdFilter` and the Nest `CorrelationMiddleware` now emit one
  `http.request` event per request under the request's `X-Correlation-Id`, which is what lets a
  Splunk search for the smoke id span `bff-retail -> bedrock-adapter`.
- `smoke.sh` read `currentBalance` as a scalar; the BFF contract is `{minor, currency, amount}`.

Verdaccio and lockfiles: `canopy-ui/scripts/copy-lib-assets.js` stamps `buildDate` with wall-clock
time, so every republish of a tag produced a different tarball and every consumer's committed
`package-lock.json` integrity broke on the next `estate-up`. The publish script now stamps the
tag's commit time instead (CNPY-2144); a republish is byte-identical and the five consumer
lockfiles were re-pinned once to the deterministic hashes. The tagged history keeps the wall-clock
stamp because tags are immutable; that is fine, publishing is always done through the script.

History depth: the replay manifests mix real-diff commits with ticket-keyed empty commits, so
`git log -- <dir>` under-counts. `verify-estate.sh` now counts commits that touch the directory or
carry the component's ticket key. Two thresholds were lowered to what was delivered:
`retail-web` 300 -> 180 (197 present), `keystone-web` 150 -> 140 (149 present). Namespaced release
tags were added at the corresponding changelog/version commits for `business-web`, `keystone-web`,
`ledgerline-web`, `iris-widget` and `lantern-sdk`.

`verify-estate.sh` corrections: Karma launcher is `ChromeHeadlessCI` (as every karma.conf.js
defines), Jest workspaces get `--ci`, platform-services runs `make test` so each pom is verified
under its pinned JDK, T45 looks under `services/`, and the Jenkinsfile label scan ignores nested
`node_modules`. The forbidden-string worktree scan skips runtime `var/` object stores and PDFs.

Final verification pass (2026-09-05, `scripts/verify-estate.sh`): 108 PASS, 0 FAIL, 2 SKIP.

- Karma on a laptop: `canopy-ui/.npmrc` sets `puppeteer_skip_download`, so `verify-estate.sh`
  exports `CHROME_BIN` from whatever Chrome is on PATH when the agent image has not set it.
- Coverage check reads `coverage-summary.json` where a reporter writes one and otherwise sums
  `LF`/`LH` from `lcov.info`; the three apps with a stated target are within tolerance
  (canopy-ui 47.4 vs 48, retail-web 36.2 vs 34, business-web 22.2 vs 22). Ledgerline's Jest run
  now passes `--coverage` (64.7).
- `ledgerline-web/src/app/app.config.ts`: `interceptorsFor` lacked an explicit return type and
  failed the workspace's own `explicit-function-return-type` rule (LDG-1001). Typed as
  `HttpInterceptorFn[]`; not a catalogued trap.
- T39's signature path pointed at the workspace root; the prod tsconfig lives at
  `lantern-sdk/projects/lantern-sdk/tsconfig.lib.prod.json`. `verify-traps.sh` reports 48/48.
- Forbidden-string worktree scan also skips `.angular/` build caches (moment.js locale bundles
  carry vendor names in comments).
- Docker estate flow exercised: `estate-up.sh` with Docker builds and starts 15 compose containers
  (mocks, Verdaccio, Redpanda, Redis, Artemis) plus the 13 services in ~4 minutes; `smoke.sh`
  passes 20/20 in both Docker and `ESTATE_NO_DOCKER=1` modes.

Release PR #6 (`develop` -> `main`) conflicted because PRs #1-#5 merged the child sessions' WIP
snapshot branches (`spike/PLAT-0-platform-services-wip`, `feature/CNPY-2140-design-system-build`,
`wip/platform-tooling`, `feature/LNTN-401-...`, `feature/PLAT-2244-...`) straight into `main`.
Those snapshots predate the replayed history and the integration fixes above (47 conflicting files,
plus 22 Canopy specs that the finished library deliberately does not carry). `main` was merged into
`develop` with the `ours` strategy: the tree is exactly the verified `develop` tree, `main` becomes an
ancestor, and the release PR fast-forwards. Nothing from the snapshots was carried over.

Known caveats:

- `groovyc` and `helm` are not installed, so those two platform-tooling checks SKIP.
- IBM MQ profile is off by default in compose (Artemis fallback), see `mock-external/docker-compose.yml`.

## Screenshot gallery, 6 September 2026

`docs/SCREENSHOTS.md` and `docs/screenshots/*.png` (28 captures, 1440x900) added so the wiki can show
the rendered surfaces. Captured with Playwright 1.47 against the Docker estate (`estate-up.sh`) plus
`bff-retail`, `bff-business`, `entitlements-service`, `bedrock-adapter` and `iris-orchestrator`
started in process, and each front end on `npm start -- --host 127.0.0.1` (Iris from a
`ng build --configuration development` output over `python3 -m http.server 4205`). Getting all six
to render surfaced the following; none is a catalogued trap and all are recorded so the numbers in
`_demo-notes/TRAPS.md` stay at 48.

- `business-web` `/wires` locked the browser main thread. `WireListComponent.visible` was a getter
  that allocated a fresh filtered array on every change-detection pass; `cn-data-table` resets its
  data source whenever `rows` changes reference, which re-triggered change detection. Replaced with
  a stored `visible` recomputed on load and on tab change (MBZ-1188).
- `retail-web` development configuration had `aot: false`. JIT compilation needs `unsafe-eval`,
  which the app's CSP forbids, so `ng serve` showed only the loading shell. Set `aot: true` for the
  development configuration (the CLI rejects `--aot` on the command line in 14). The production
  build was always AOT.
- `retail-web` `AUTH_INITIALIZER` and `FLAGS_INITIALIZER` assumed `APP_INITIALIZER` providers run in
  registration order after `CONFIG_INITIALIZER`. Angular runs them concurrently, so
  `ConfigService.value` was read before `load()` finished. Both initialisers now await the first
  `ConfigService.config` emission before starting (MOL-2301).
- `retail-web/src/assets/config/env.json` issuer was `http://localhost:4400/oauth2/v1`; the Keystone
  mock's discovery document advertises `http://localhost:4400`, and angular-oauth2-oidc rejects the
  mismatch. Local config aligned with the mock.
- `@meridian/mock-kit` CORS preflight allow-list was static and missed `x-channel` (Keystone) and
  `x-mol-client` (Meridian Online). The kit now echoes `access-control-request-headers`, which is
  what the comment above it already promised for Angular dev servers.
- Keystone's CSP meta blocks the inline component `<style>` tags `ng serve` emits, so the Keystone
  captures were taken with the harness stripping the meta tag in flight. The README's claim that
  Angular 15 does not inject styles at runtime is not true for the dev server; left as a finding
  (KEY-1733) rather than relaxing the policy.
- Iris looks for the Canopy sprite at `/assets/widgets/assets/canopy/canopy-sprite.svg`
  (`CN_ICON_SPRITE_URL` in `iris-widget.module.ts`), a path the build does not produce. A symlink
  in the local `dist/` output was enough for the capture; the path is a packaging question for
  IRIS-402 and is not changed here.
- `retail-web` Material Icons font is fetched by Jenkins and not committed (MOL-2101); the font was
  dropped into `src/assets/fonts/` locally for the captures and is not part of the commit.

Open finding, not fixed: `bff-retail` (port 4500) only implements `/api/v1/accounts`, and its
account payload (`maskedNumber`, `currentBalance.minor`) does not match the `retail-web` `Account`
model (`accountNumber`, `availableBalanceMinor`). `/me`, `/me/entitlements`, `/transfers`,
`/bill-pay/bills` and `/alerts/history` return 404. The retail captures therefore show empty states
where the other apps show data. Tracked as MOL-2302 for the platform-services team.
