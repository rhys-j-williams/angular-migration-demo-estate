# Meridian Online (`retail-web`)

Consumer online banking. Angular 14, NgRx, Canopy. Owned by @meridian/retail-digital (Charlotte
and Plano, with the payments work shared with @meridian/payments-platform in Jersey City and
Chennai). Jira project `MOL`. On call rota is in the team space; the app is Tier 1 so the rota is
real.

If you are new: read CONTRIBUTING.md, then `docs/architecture.md`, then skim the ADRs in
`docs/adr/`. The architecture diagram is a little behind (it still shows the Iris widget being
served from here; it has been its own repo since MOL-3410) but the shape is right.

## Toolchain

| Thing | Version | Where it is pinned |
|---|---|---|
| Node | 16.20.2 | `.nvmrc`, Jenkins agent label `nodejs16-rhel8` |
| npm | 8.19.4 | comes with Node 16 |
| Angular | 14.3.0 | `package.json`, exact |
| Angular CLI | 14.2.13 | `package.json` |
| TypeScript | 4.7.4 | `package.json` |
| RxJS | 7.5.7 | `package.json` |
| NgRx | 14.3.3 | `package.json` |
| Canopy UI | 3.7.2 | `package.json`, `@meridian/canopy-ui` |
| Lantern SDK | 2.4.1 | `package.json`, `@meridian/lantern-sdk` |

Everything is exact-pinned. `save-exact=true` is in `.npmrc` so `npm install <thing>` does the
right thing. Do not add `^` back; we have been bitten (MOL-2270, the zone.js patch that broke
`fakeAsync` across 40 specs overnight).

`@types/node` is pinned to 16.18.11 on purpose. Newer 16.x builds ship `Disposable` declarations
that TypeScript 4.7 cannot parse and the build dies with TS2304. See BUILD notes in MOL-4433.

The Angular upgrade is deferred, again. `docs/adr/0014-defer-angular-upgrade-2024.md` has the
reasons and `backlog/MOL-4471/` has the epic. Do not `ng update` on `develop`. Someone tried on
`feature/MOL-3801-angular15-spike`; `SPIKE_NOTES.md` is what came back.

## Running it

```
nvm use
npm ci
npm start
```

`npm start` runs `ng serve` with `proxy.conf.json`, which forwards `/api` to the retail BFF on
4500, `/flags` to Semaphore on 4608 and `/telemetry` to the Splunk HEC stand-in. All of those come
from `mock-external/estate-up.sh` at the repo root; without them you get a login redirect to
nothing. Keystone (the mock, port 4400) accepts any customer from `@meridian/domain-fixtures` with
the OTP `000000`.

`postinstall` runs `ngcc` because the Lantern SDK is still shipped as View Engine (LNTN-140, the
vendor's Ivy build has been "next quarter" since 2022). If `npm ci` hangs for a minute on the
postinstall line that is what it is doing. Do not remove it; the app compiles without it and then
fails at runtime with `LanternModule.forRoot is not a function`, which is a fun one at 02:00.

Runtime configuration is `src/assets/config/env.json`, loaded by an `APP_INITIALIZER` before
anything else. Per-developer overrides go in `env.local.json` (gitignored). In every deployed
environment the ConfigMap replaces the file wholesale; the committed one is the local shape and
nothing else.

## Tests

```
npm test                    # watch mode, Chrome
npm run test:ci             # headless, coverage, what Jenkins runs
```

Karma with headless Chrome and `--no-sandbox` for the agents (`karma.conf.js`). Coverage sits in
the mid thirties. The number is not the point; the distribution is. Every guard, interceptor and
reducer has a real spec. Most components have a creation spec and nothing else. Transfers and bill
pay have almost no component specs, which is the wrong way round for the compliance-critical code
and is tracked as MOL-4476 under the upgrade epic because the untyped forms in there are also what
makes them hard to test. Two specs are `xit` with a ticket each; search for `xit(` if you want to
argue about them.

Do not pad coverage to get a Sonar gate through. Fix the gate or fix the tests.

`npm run e2e` still exists. It has not run in CI since the agents moved to RHEL 8 (MOL-3644). See
`e2e/protractor.conf.js` before you spend time on it.

## Building

```
npm run build:prod                  # en-US and es, service worker, AOT
npm run build:analyze               # single locale, stats.json for webpack-bundle-analyzer
npm run i18n:extract                # regenerates src/locale/messages.xlf
node tools/verify-ngsw.js           # CAB wants this output attached to the change record
```

Two i18n mechanisms, both in use. `$localize` for anything in templates and component copy;
`ngx-translate` for the content the marketing team edits through the CMS (`assets/i18n/*.json`,
promo banners, disclosures, help). ADR 0009 explains why we have both and why we have not
consolidated. Spanish `.xlf` is produced by the vendor and merged with `tools/i18n/merge-xlf.py`;
never edit `messages.es.xlf` by hand.

The build uses the Webpack browser builder with `aot: false` in the development configuration
because the `ng serve` cycle was over a minute with AOT on the Plano laptops in 2022. Production
is AOT. Yes, this means templates that are wrong only fail on a prod build; the Jenkins PR job runs
a prod build for that reason.

## Layout

```
src/app/core        config, auth (Keystone PKCE), guards, interceptors, session, telemetry, store
src/app/shared      SharedModule: Canopy re-exports, pipes, directives, masked-number, etc.
src/app/features    lazy feature modules, one NgRx slice each
src/locale          extracted and translated .xlf
src/assets/config   runtime env.json
docs/               ADRs, runbooks, architecture
backlog/            epic and story notes that do not fit in Jira (MOL-4471)
e2e/                Protractor. See above.
tools/              scaffolder, i18n merge, ngsw check
```

Features: dashboard, accounts, transfers, bill-pay, cards, statements, alerts, profile, messages,
rewards, onboarding, help, disclosures, errors. Each is a lazy module behind `LazyModuleGuard`
where entitlement matters (transfers, bill-pay, cards) and `FeatureFlagGuard` where Semaphore
gates it (rewards, messages, onboarding).

## Things that get asked every quarter

- Why session storage for tokens? GIS-STD-021. Local storage survives the tab and the shared
  branch kiosks were the incident (INC-2021-1140).
- Why does the idle timeout not use a library? It did (`ng-idle`), it disagreed with zone.js after
  a patch bump, and rewriting it on RxJS timers took an afternoon. `core/session/idle-timeout.service.ts`.
- Why is MFA step-up on transfers by amount and not always? Regulation and customer complaints,
  in that order. The threshold is runtime config (`transfers.mfaStepUpThresholdMinor`) and the
  claim age is ten minutes (`mfaMaxAgeSeconds`). `MfaStepUpGuard`.
- Why is the Iris chat widget not here? MOL-3410, it is its own repo and loads from the CDN.
- Why flex-layout? 2020. It is on the deferral list.
