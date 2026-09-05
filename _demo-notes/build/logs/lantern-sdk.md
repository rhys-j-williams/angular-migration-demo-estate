# lantern-sdk build log

Session: child of devin-33d87f034cb94e598251e11c57b97948 (same session built `mock-external`,
separate log). Branch `feature/LNTN-401-lantern-sdk-view-engine`, 60 replayed commits from
`develop` (2021-02 to 2024-11) plus this note. Scratch branch `wip/lantern-sdk` not pushed.

## Toolchain used

Node 14.21.3 via nvm (npm 6.14.18). `@angular/cli@12.2.18` installed globally inside the Node 14
nvm environment, as phase 0 found `npx @angular/cli@12` does not resolve on Node 14. Angular
12.2.17, TypeScript 4.3.5, ng-packagr 12.2.7, rxjs 6.6.7, zone.js 0.11.4, tslint 6.1.3 + codelyzer,
karma 6.3.20 with ChromeHeadless from `/home/ubuntu/.local/bin/google-chrome` (`CHROME_BIN`).
`@types/node` pinned to 16.18.11 (the `Disposable` problem from BUILD_LOG.md).

## Verification results

- `ng build lantern-sdk --configuration production`: clean. `dist/lantern-sdk/` carries
  `lantern-sdk.metadata.json`, fesm2015/es2015 bundles and typings; no `ɵcmp`, `ɵdir`, `ɵmod`,
  `ɵfac` or `ɵɵdefine*` anywhere in the output.
- `scripts/verify-view-engine.js` on the dist and on the `npm pack` tarball
  (`meridian-lantern-sdk-2.4.1.tgz`): PASS on both.
- `npm test` (`ng test --watch=false --browsers=ChromeHeadlessCI`): 18 of 18 SUCCESS in Chrome Headless 133 (service, router
  tracker, click directive, session interceptor, module/forRoot duplicate-root guard).
- `npm run lint` (tslint + codelyzer): clean.
- `scripts/publish.sh` with `DRY_RUN=1`, then a real publish to the local Verdaccio from
  `mock-external/scripts/publish-internal.sh`; `npm view @meridian/lantern-sdk --registry
  http://localhost:4873` shows 2.4.1.
- `scripts/check-forbidden-strings.sh worktree`: PASS.

## Substitutions and workarounds

- View Engine's metadata collector under `strictMetadataEmit` cannot resolve the DOM `Document`
  type and rejects `unknown` in constructor metadata ("Expression form not supported"). The
  injected `DOCUMENT` and `PLATFORM_ID` parameters are typed `Object` with a tslint `ban-types`
  suppression and cast onto a typed private field. This is what the real 2021 code would have done;
  it is not a trap.
- Debug logging goes through the global `console` rather than `window.console`, because the
  `LanternWindow` interface does not declare it.
- The duplicate `forRoot()` guard spec needed a real second injector boundary
  (`Compiler.compileModuleSync` + a child injector); `TestBed` alone shares one root.
- Karma runs under `ChromeHeadlessCI` (`--no-sandbox`) because the box has no user namespaces.

## Traps

- T39, armed: `projects/lantern-sdk/tsconfig.lib.prod.json` sets `enableIvy: false`, so the
  published 2.4.1 is View Engine format (`metadata.json`, no Ivy definitions). Angular 14 consumers
  run ngcc over it at install; ngcc is gone at Angular 16 so the package has to be republished in
  Ivy/partial format first. The README's compatibility section presents Angular 12 as the supported
  baseline, the history carries LNTN-183 (2021, View Engine prod config) and LNTN-361 (2023, Ivy/partial
  output assessed and deferred to the Vendor Relationship team, H1 2025 train), and the CHANGELOG
  and README both reference LNTN-361. `scripts/verify-view-engine.js` fails the publish if anyone
  flips the flag by accident, which is the guard the consuming teams will hit.
- Supporting texture: peerDependencies are `>=12.0.0 <13.0.0` for `@angular/core`, `common` and
  `router`, which is what produces the `legacy-peer-deps` need in the Angular 14 apps.

## Not done

- Nothing from the brief omitted. The library was not exercised inside a consuming Angular 14 app
  in this session (that is the app teams' branch); the ngcc behaviour is inferred from the package
  format, not observed.
