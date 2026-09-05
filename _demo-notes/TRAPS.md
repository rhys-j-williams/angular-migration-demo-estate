# Trap catalogue

Forty eight deliberate problems, each one a thing a real bank estate accumulates. Every trap
compiles and passes its tests at the version the estate is on today, and bites at the migration
step named in the table. `scripts/verify-traps.sh` greps for each signature and reports present or
missing; keep the signatures in this file and in that script in step.

**Do not fix these.** They are the demonstration. If a build breaks because of one, the trap is
working.

## How to read the table

- **Signature** is the string `verify-traps.sh` greps for, in the path given.
- **Bites at** is the Angular major where the estate stops compiling, or `review` where the problem
  is a finding rather than a break, or `coverage` where it is a testing gap.
- **Expected agent behaviour** is what a good Devin run should do. The presenter checks answers
  against this column.

## Canopy design system, T1 to T17

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T1 | `canopy-ui/projects/canopy-ui/src/styles/themes/_canopy-theme.scss` | `$subheading-2` | 15 | Migrate the typography level names to the v15 API. Every consumer's theme file changes with it. |
| T2 | `canopy-ui/projects/canopy-ui/src/lib/buttons/cn-button/cn-button.component.scss` | `.mat-button-wrapper` | 15 legacy tolerates it, 17 removes it | Restyle against the MDC button structure, or drop the override and use spacing tokens. |
| T3 | `canopy-ui/projects/canopy-ui/src/lib/forms/cn-currency-input/cn-currency-input.component.ts` | `MatFormFieldControl` | 15 or 17 | Reimplement prefix alignment on the MDC form field. The `MatFormFieldControl` contract itself also shifts. |
| T4 | `canopy-ui/projects/canopy-ui/src/lib/forms/cn-select/cn-select.component.scss` | `.mat-select-panel` | 15 or 17 | Retarget to MDC classes and re-verify keyboard navigation, which the panel styles affect. |
| T5 | `canopy-ui/projects/canopy-ui/src/lib/forms/cn-toggle/cn-toggle.component.scss` | `.mat-slide-toggle-bar` | 15 or 17 | Retarget, then screenshot. The brand thumb colour is a design sign-off item. |
| T6 | `canopy-ui/projects/canopy-ui/src/lib/forms/cn-date-range/cn-date-range.module.ts` | `MatMomentDateModule` | every step, plus a modernisation item | Flag moment as deprecated and propose a date-fns or luxon adapter. Do **not** swap the adapter inside an upgrade PR. |
| T7 | `canopy-ui/projects/canopy-ui/src/lib/data-display/cn-data-table/cn-data-table.component.scss` | `.mat-header-cell` | 15 or 17 | Retarget the density styles; the harness tests confirm behaviour survived. |
| T8 | `canopy-ui/projects/canopy-ui/src/lib/data-display/cn-filter-chips/cn-filter-chips.component.ts` | `MatChipList` | 15 | A component rewrite onto `MatChipListbox` and `MatChipOption`, not a rename. Selection semantics differ. |
| T9 | `canopy-ui/projects/canopy-ui/src/lib/forms/cn-amount-slider/cn-amount-slider.component.html` | `thumbLabel` | 15 | Rewrite on the MDC slider. `tickInterval` has no equivalent — this one needs a product decision, so ask. |
| T10 | `canopy-ui/projects/canopy-ui/src/lib/navigation/cn-tabs/cn-tabs.component.scss` | `.mat-ink-bar` | 15 or 17 | Retarget to the MDC tab indicator. |
| T11 | `canopy-ui/projects/canopy-ui/src/lib/overlays/cn-dialog-shell/cn-dialog-shell.component.scss` | `.mat-dialog-container` | 15 or 17 | Retarget, or express the padding through MDC density tokens. |
| T12 | `canopy-ui/projects/canopy-ui/src/lib/overlays/cn-toast/cn-toast.component.scss` | `.mat-simple-snackbar` | 15 or 17 | Retarget to the MDC snackbar structure. |
| T13 | `canopy-ui/projects/canopy-ui/src/lib/overlays/cn-tooltip/cn-tooltip.directive.scss` | `.mat-tooltip` | 15 or 17 | Retarget to `.mdc-tooltip`. |
| T14 | `canopy-ui/projects/canopy-ui/src/lib/feedback/cn-progress/cn-progress.component.scss` | `.mat-progress-bar-fill` | 15 or 17 | Stop overriding the fill; drive the colour from the theme palette. |
| T15 | `canopy-ui/projects/canopy-ui/src/lib/layout/` and fifteen `retail-web` templates | `fxLayout` | 15, when flex-layout reaches end of life | Replace with CSS grid and flex utilities. No visual change permitted; screenshot before and after. |
| T16 | `canopy-ui/projects/canopy-ui/src/lib/content/cn-disclosure/cn-disclosure.component.ts` | `bypassSecurityTrustHtml` | review, at any step | Flag it for security review with the trust boundary spelled out. Do **not** silently change it — regulatory disclosure markup has to render. |
| T17 | `canopy-ui/projects/canopy-ui/src/lib/data-display/cn-data-table/cn-data-table.component.spec.ts` | `.mat-header-cell` | 15 or 17 | Rewrite the assertion against behaviour rather than internal class names. This test breaks honestly. |

## Meridian Online (retail-web), T18 to T29

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T18 | `retail-web/src/polyfills.ts` | `zone.js/dist/zone` | 15 | Change to `import 'zone.js'`. Trivial, but it fails the build before anything else does. |
| T19 | `retail-web/src/app/core/guards/lazy-module.guard.ts` | `CanLoad` | 15 deprecation, later removal | Migrate to `CanMatch` on all three lazy modules, preserving the flag-driven behaviour. |
| T20 | `retail-web/src/app/core/core.module.ts` | `HttpClientXsrfModule.withOptions` | 18 deprecation | Move to `provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration(...))`, keeping the class-based interceptors registered through `HTTP_INTERCEPTORS` working. |
| T21 | `retail-web/src/app/app-routing.module.ts` | `relativeLinkResolution` | 15 removal | Remove the option and test every relative `routerLink`; a handful genuinely depend on legacy resolution. |
| T22 | `retail-web/src/app/core/telemetry/lantern.service.ts` | `LanternModule.forRoot` | 16 | Detect that `@meridian/lantern-sdk` is View Engine, report the vendor dependency and propose the republish. Do not stub the SDK out to make the build pass. |
| T23 | `retail-web/src/app/features/profile/` | `UntypedFormBuilder` | modernisation | Offer typed forms as a follow-up story, not inside the upgrade PR. |
| T24 | `retail-web/src/app/features/cards/`, `retail-web/src/app/features/statements/` | `.toPromise()` | RxJS deprecation, removed in 8 | Replace the six uses with `firstValueFrom` or `lastValueFrom`, minding the empty-completion difference. |
| T25 | `retail-web/e2e/protractor.conf.js` | `protractor` | dead tooling | Propose a Cypress or Playwright migration as its own story. Note the suite has not run since 2023. |
| T26 | `retail-web/tsconfig.json` | `"strict": false` | schematic behaviour | Report it and explain which schematics behave differently. Do not flip strictness during an upgrade. |
| T27 | `retail-web/package.json` | `"overrides"` | dependency audit gate | Report the two unresolved advisories, resolve where a patched version exists inside the version constraints, escalate where it does not. |
| T28 | `retail-web/.npmrc` | `strict-ssl` | review | Flag the commented `strict-ssl=false` line and `always-auth=true`, recommend removal, note it dates from a 2022 build agent problem. |
| T29 | branch `feature/MOL-3801-angular15-spike`, `retail-web/SPIKE_NOTES.md` | `SPIKE_NOTES` | discovery | Find it when asked whether anyone has attempted the upgrade before, and summarise why it was abandoned. |

## Meridian Business (business-web), T30 to T34

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T30 | `business-web/src/styles.scss` and six components | `::ng-deep` | 15 or 17, and every Canopy bump | Consolidate the overrides into Canopy where they are legitimately shared, retarget the rest. Screenshot everything. |
| T31 | `business-web/package.json`, `business-web/src/app/**` | `rxjs/operators` with RxJS 6 | 15 needs 6.5+ or 7, 16 effectively needs 7 | Upgrade RxJS to 7 as a prerequisite step in its own pull request, before the Angular bump. |
| T32 | `business-web/tslint.json` | `codelyzer` | tooling debt | Migrate to angular-eslint as a prerequisite step. |
| T33 | `business-web/.nvmrc`, `business-web/.npmrc` | `engine-strict` | 16 drops Node 14 | Raise the Node floor and coordinate the Jenkins agent label change. Flag that this needs the platform team, not the app team. |
| T34 | `business-web/Jenkinsfile` | `nodejs14-rhel7` | 16 | Change the agent label to `nodejs16-rhel8` or later, and note the platform dependency and lead time. |

## Widgets, identity and treasury, T35 to T39

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T35 | `iris-widget/src/main.ts`, `retail-web/src/index.html` | `meridian-iris-widget` | every zone.js bump | Two Angular bundles share one Zone.js on the help page. Upgrade host and widget in lockstep, or isolate the widget, and explain the risk either way. |
| T36 | `keystone-web/src/app/**`, `keystone-web/src/styles/_theme.scss` | `material/legacy-` | 17 removes legacy | Complete the half-finished MDC migration, retire `mat.all-legacy-component-themes`, screenshot every auth screen. This is the login page for the whole bank. |
| T37 | `ledgerline-web/patches/` | `@meridian+canopy-ui` | every Canopy release | Retire the patch-package patch once Canopy publishes an Angular 16 compatible major. Until then every Canopy release reapplies it by hand. |
| T38 | `ledgerline-web/src/app/canopy-compat/` | `canopy-compat` | Canopy upgrade | Delete the local `cn-filter-chips` reimplementation when Canopy ships MDC chips. Duplicated code the library upgrade should retire. |
| T39 | `lantern-sdk/projects/lantern-sdk/tsconfig.lib.prod.json`, `retail-web/package.json` | `enableIvy` / `ngcc` | 16 | ngcc is gone at 16. The wrapper must be republished in Ivy partial format, which means the Digital Analytics Enablement team and the vendor relationship, not the app team. Remove the `postinstall` only once that lands. |

## Build, i18n and formatting, T40 to T43

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T40 | `retail-web/angular.json`, `business-web/angular.json` | `build-angular:browser` | 18 offers the application builder, 22 deprecates Webpack | Run the builder migration at 18 and update the Jenkins stages that parse Webpack output. |
| T41 | `retail-web/ngsw-config.json` | `ngsw-config` | every step | Bump the service worker with the framework and verify the update flow, or customers sit on a stale app shell. |
| T42 | `retail-web/src/locale/messages.es.xlf`, `retail-web/src/assets/i18n/es.json` | `messages.es.xlf` | every step | Both ngx-translate and `$localize` are in use. Keep both working and verify extraction; the es build is a regulatory commitment in some states. |
| T43 | `business-web/src/app/legacy/nacha-format.constants.ts`, `canopy-ui/projects/canopy-ui/src/lib/tokens/_legacy-tokens.scss` | CRLF line endings | any diff | Two files are CRLF despite `.gitattributes`. Do not reformat them wholesale; keep the diff to the lines actually changed. |

## Test coverage, T44 to T46

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T44 | `platform-services/beacon-notifications/src/main/java/**/ordering/` | `SequenceNumber` | coverage | Per-customer alert ordering is untested. Write characterisation tests before touching it. |
| T45 | `platform-services/statements-api/`, `platform-services/exposure-calc/` | absence of `pytest.ini`/`pyproject` test config | coverage | No test framework at all and no CI test job. Add pytest and the CI job first, then write tests. |
| T46 | `platform-services/pii-vault-service/` | JaCoCo line coverage ~8% | coverage | Format-preserving tokenisation and access logging at eight percent, on a compliance-critical service. Edge cases first. |

## Estate-level, T47 and T48

| Id | Path | Signature | Bites at | Expected agent behaviour |
| --- | --- | --- | --- | --- |
| T47 | consumer `package.json` files | `"@meridian/canopy-ui": "3.5.0"` in business-web, `3.6.1` in keystone-web, `3.7.2` elsewhere | library first, consumers next | Upgrade the library, republish, then move every consumer in parallel. business-web needs a two-hop, 3.5.0 to 3.7.2 and then to the new major. This is the fan-out the demo is about. |
| T48 | `canopy-ui/CONTRIBUTING.md` | `public API of Canopy is frozen` | every change | Respect the contract. An Angular 15+ Canopy is a 4.0.0, not a 3.8.0, and the consumers need to be told. |

## Verification

```bash
scripts/verify-traps.sh          # present / missing per trap
scripts/verify-traps.sh --strict # non-zero exit if any trap is missing
```

A missing trap means someone fixed it, or the component that carries it has not been built yet.
Check which before assuming the worst.
