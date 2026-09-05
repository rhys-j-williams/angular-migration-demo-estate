# Build log: iris-widget

Estate construction notes for the Iris assistant widget slice. Phase 1, September 2026. Merged into
the root BUILD_LOG.md by the parent session.

Branch: `feature/IRIS-0815-iris-widget`, 70 commits replayed from `iris-widget/.history/manifest.json`
(June 2022 to November 2024, retail-digital authors plus gis-appsec and platform-engineering
cameos, one dependency bot). Ticket key IRIS. Scratch branch `spike/IRIS-0-iris-widget-wip` is
also on the remote and can be deleted once integrated.

## Environment

- Node 16.20.2 via nvm, npm 8.19.4. Chrome at `~/.local/bin/google-chrome`, `CHROME_BIN` exported.
- Angular 14.3.0 (framework, compiler-cli, elements), CLI and build-angular 14.2.13, Material/CDK
  14.2.7, ngx-build-plus 14.0.0, TypeScript 4.7.4, RxJS 7.5.7, zone.js 0.11.8 (dev/test only, see
  below), Canopy 3.7.2 from the local Verdaccio. `@types/node` 16.18.11 pinned.
- `.npmrc` in `iris-widget/`: `legacy-peer-deps=true`, `save-exact=true`, `@meridian:registry` for
  Verdaccio on 4873.

## Verification

- `npm ci`, `npm run lint` (angular-eslint, clean), `npm test -- --watch=false` (14 specs, 77%
  lines: deliberately thin, brief says minimal Karma), `npm run build:prod` all pass.
- Production output: one bundle `main.<hash>.js` (430 kB raw / 105 kB transfer), byte-identical
  copy `iris.js`, `iris.manifest.json`, Canopy sprite under `assets/canopy/`, Zone UMD under
  `assets/vendor/` for Angular-less hosts.
- **Mount proof**: `npm run harness:check` starts a static server that lays `dist/` out at
  `/assets/widgets/` (same path retail-web will use), serves a plain HTML page
  (`scripts/harness/index.html`) that loads Zone then `/assets/widgets/iris.js` and puts
  `<meridian-iris-widget open>` in the body, drives headless Chrome at it, and asserts
  `customElements.define` fired, `.iris-root`, the launcher and the open panel rendered, and that
  exactly one Zone instance exists on the page. Passes. This runs in the Jenkinsfile too.
- `scripts/verify-traps.sh T35` PRESENT. `scripts/check-forbidden-strings.sh worktree` PASS.

## T35 (two Angular bundles, one Zone.js)

Widget side only; retail-web's session places the host side.

- `src/polyfills.ts` is empty on purpose, `src/main.ts` throws a readable `[iris-widget]` error if
  `window.Zone` is absent, and `scripts/postbuild.js` fails the build if Zone code is found in the
  bundle. Karma (`src/test-polyfills.ts`) and the dev shell (`src/index.html`) load Zone themselves.
- Mount contract in `README.md`: `/assets/widgets/iris.js` (stable) or the hashed name from
  `iris.manifest.json`, `<script defer>` after the host's Angular bundles, attribute list
  (`orchestrator-url`, `channel`, `bearer-token`, `sprite-url`, `open`), events `irisOpen`/`irisClose`.
- README states plainly, in a table and in bold, that the widget's Angular and the host's Zone.js
  must move in lockstep or be isolated; ADR 0002 records the decision and a 2024 retro note;
  `iris.manifest.json` carries `zoneJsCompatible: 0.11.8` with an open ticket (IRIS-0790) for the
  build-time check that nobody wired in. The stage story: retail-web upgrades to 15/16/17, its Zone
  moves, the widget on Angular 14 boots against a Zone it was never tested with, help page breaks.

For retail-web's session: serve `dist/iris-widget/` at `/assets/widgets/`, load
`/assets/widgets/iris.js` with `defer` after your bundles, mount `<meridian-iris-widget
bearer-token="...">`. Your `zone.js` today should be 0.11.8 to match.

## Orchestrator integration

Pointed at the real `platform-services/iris-orchestrator` after develop was updated: `/iris/v1`,
`POST /sessions` (empty body), `POST /sessions/:id/messages {text}`, `GET /sessions/:id/transcript`,
`Authorization: Bearer <keystone token>`, reply shape copied from
`conversation.types.ts`. The first cut of the client had guessed a richer request body; rewritten.
Dev shell uses an unsigned token that the orchestrator accepts in its insecure-local mode.

## Substitutions and workarounds

- **Angular CLI cache disabled** in `angular.json` (`cli.cache.enabled: false`). The cache under
  `.angular/` contains stringified source that tripped the forbidden-strings hook (it scans the
  working tree, and `.gitignore` does not exempt it). No functional effect.
- **`zone.js/testing` ordering.** With `zone.js/testing` in `test-polyfills.ts` every spec failed
  with "Expected to be running in ProxyZone". Moved it into `test.ts` after the environment
  setup. Both files are listed in `tsconfig.spec.json` `files`.
- **Harness deadlock.** First `check-mount.js` used `execFileSync` for Chrome while hosting the
  HTTP server in the same process; Chrome waited on a server that could not tick. Switched to
  async `execFile` and a throwaway `--user-data-dir`.
- `@types/node` pinned to 16.18.11 (phase 0 note, `Disposable`). Nothing else substituted; all
  versions in the brief installed as stated.

## Not done / caveats

- No `retail-web/` side. The contract is written for them; nothing in this branch touches their
  directory.
- Coverage is 77% on a very small codebase; the brief asked for "minimal" tests and the README
  is honest about what the number means. No coverage gate (IRIS-0490 in the history).
- `iris-widget/.history/` is gitignored at the root, so the manifest is not on the branch; the
  generator is estate tooling on the build box only.
