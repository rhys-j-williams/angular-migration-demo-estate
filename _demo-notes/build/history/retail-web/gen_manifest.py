#!/usr/bin/env python3
"""Generate retail-web/.history/manifest.json for replay_history.py. Estate tooling, not a bank artefact."""
import json
import random
import subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path('/home/ubuntu/repos/angular-migration-demo-estate')
RW = 'retail-web'
rng = random.Random(4471)

tracked = subprocess.run(['git', '-C', str(ROOT), 'ls-files', RW], capture_output=True, text=True).stdout.split()
tracked = [t for t in tracked if t != f'{RW}/.history/manifest.json']
assigned = set()
commits = []

RD = ['d.okafor', 'm.calderon', 's.whitfield', 'b.arceneaux']
PAY = ['j.hollins', 'p.venkatesan', 'a.balaraman']
GIS = ['c.mbeki', 'v.orlova']
BOT = 'meridian-dependency-bot'


def take(*globs):
    import fnmatch
    out = []
    for g in globs:
        for t in tracked:
            if t in assigned:
                continue
            if fnmatch.fnmatch(t, f'{RW}/{g}'):
                out.append(t)
                assigned.add(t)
    return out


def c(date, author, message, paths=None, body=None, **extra):
    entry = {'date': date, 'author': author, 'message': message}
    if body:
        entry['body'] = body
    if paths:
        entry['paths'] = paths
    elif 'content' not in extra and 'patch' not in extra:
        entry['empty'] = True
    entry.update(extra)
    if 'content' in extra or 'patch' in extra:
        entry['paths'] = sorted(set(entry.get('paths', [])) | set(extra.get('content', {})) | set(extra.get('patch', {})))
        entry.pop('empty', None)
    commits.append(entry)


def feature_files(name):
    base = f'src/app/features/{name}'
    mod = take(f'{base}/{name}.module.ts', f'{base}/{name}-routing.module.ts')
    store = take(f'{base}/store/*.actions.ts', f'{base}/store/*.reducer.ts', f'{base}/store/*.selectors.ts', f'{base}/store/*.effects.ts', f'{base}/store/index.ts')
    store_spec = take(f'{base}/store/*.spec.ts')
    services = take(f'{base}/services/*')
    comps = defaultdict(list)
    for t in list(tracked):
        if t.startswith(f'{RW}/{base}/components/') and t not in assigned:
            comps[t.split('/')[6]].append(t)
            assigned.add(t)
    rest = take(f'{base}/**')
    return mod, store, store_spec, services, comps, rest


def component_commits(name, key_start, dates, authors, mod, store, store_spec, services, comps, rest, first_msg):
    """Spread a feature's files over several commits between the given dates."""
    key = key_start
    d = iter(dates)
    c(next(d), rng.choice(authors), f'MOL-{key} {first_msg}', mod + store + rest)
    key += rng.randint(1, 3)
    if services:
        c(next(d), rng.choice(authors), f'MOL-{key} {name}: draft service and store effects', services)
        key += rng.randint(1, 3)
    names = list(comps)
    rng.shuffle(names)
    group = []
    for n in names:
        group.append(n)
        if len(group) >= rng.choice([1, 2, 2, 3]):
            paths = [p for g in group for p in comps[g] if not p.endswith('.spec.ts')]
            c(next(d), rng.choice(authors), f'MOL-{key} {name}: {", ".join(g.replace("-", " ") for g in group)}', paths)
            key += rng.randint(1, 4)
            group = []
    if group:
        paths = [p for g in group for p in comps[g] if not p.endswith('.spec.ts')]
        c(next(d), rng.choice(authors), f'MOL-{key} {name}: {", ".join(g.replace("-", " ") for g in group)}', paths)
        key += rng.randint(1, 4)
    specs = [p for g in comps for p in comps[g] if p.endswith('.spec.ts')] + store_spec
    if specs:
        c(next(d), rng.choice(authors), f'MOL-{key} {name}: reducer spec and component creation specs', specs)
        key += 1
    return key


def dates_between(start, end, n):
    """n sorted working-day dates between two ISO dates, skipping weekends."""
    from datetime import date, timedelta
    s = date.fromisoformat(start)
    e = date.fromisoformat(end)
    days = [s + timedelta(days=i) for i in range((e - s).days + 1)]
    days = [x for x in days if x.weekday() < 5]
    picks = sorted(rng.sample(days, min(n, len(days))))
    while len(picks) < n:
        picks.append(picks[-1])
    picks = picks + [picks[-1]] * 6
    return [p.isoformat() for p in picks]


# ---------------------------------------------------------------- 2020 Q4: scaffold and core
c('2020-09-14', 'd.okafor', 'MOL-1 scaffold Meridian Online with the Angular CLI',
  take('angular.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json',
       '.editorconfig', '.browserslistrc', '.gitignore', 'src/main.ts', 'src/index.html', 'src/styles.scss',
       'src/favicon.ico', 'src/assets/.gitkeep', 'src/app/app.component.ts', 'src/app/app.component.scss',
       'src/app/app.module.ts', 'src/environments/environment.ts', 'src/environments/environment.prod.ts'),
  body='ng new meridian-online --routing --style scss --strict=false. Strict off for now, MOL-2 to turn it on.')
c('2020-09-14', 'd.okafor', 'MOL-3 pin Node with .nvmrc', content={f'{RW}/.nvmrc': '14.21.3\n'})
c('2020-09-15', 'd.okafor', 'MOL-4 karma with headless Chrome for the Jenkins agents', take('karma.conf.js', 'src/test.ts'))
c('2020-09-15', 'm.calderon', 'MOL-6 polyfills and zone flags', take('src/polyfills.ts', 'src/zone-flags.ts'))
c('2020-09-16', 'd.okafor', 'MOL-8 registry config for the Meridian scope', take('.npmrc'))
c('2020-09-17', 's.whitfield', 'MOL-11 app routing shell and lazy route skeleton', take('src/app/app-routing.module.ts'))
c('2020-09-18', 'd.okafor', 'MOL-12 CONTRIBUTING and PR template', take('CONTRIBUTING.md', '.github/pull_request_template.md'))
c('2020-09-21', 'c.mbeki', 'GIS-402 CODEOWNERS with AppSec on security sensitive paths', take('CODEOWNERS', 'SECURITY.md'))
c('2020-09-22', 'd.okafor', 'MOL-15 runtime configuration from assets/config/env.json',
  take('src/app/core/config/*', 'src/assets/config/env.json'),
  body='APP_INITIALIZER blocks bootstrap until the config resolves. ConfigMap replaces the file in every deployed environment.')
c('2020-09-24', 'd.okafor', 'MOL-15 UAT env example for the ConfigMap', take('src/assets/config/env.json.uat.example', 'src/environments/environment.uat.ts'))
c('2020-09-28', 'm.calderon', 'MOL-18 core module and root state', take('src/app/core/core.module.ts', 'src/app/core/store/root-state.ts'))
c('2020-09-30', 'm.calderon', 'MOL-19 session slice: actions, reducer, selectors',
  take('src/app/core/store/session/session.actions.ts', 'src/app/core/store/session/session.reducer.ts',
       'src/app/core/store/session/session.selectors.ts', 'src/app/core/store/session/index.ts'))
c('2020-10-02', 'd.okafor', 'MOL-22 Keystone sign-in with authorization code and PKCE',
  take('src/app/core/auth/auth.service.ts', 'src/app/core/auth/auth.initializer.ts', 'src/app/core/auth/session-claims.model.ts',
       'src/assets/vendor/silent-refresh.js', 'src/silent-refresh.html'),
  body='angular-oauth2-oidc. Implicit flow rejected by Keystone team (KEY-311) and by GIS.')
c('2020-10-05', 'd.okafor', 'MOL-22 session effects for login, refresh and logout', take('src/app/core/store/session/session.effects.ts'))
c('2020-10-06', 's.whitfield', 'MOL-24 shell, auth callback and logged out pages',
  take('src/app/shell/shell/*', 'src/app/shell/auth-callback/*', 'src/app/shell/logged-out/*'))
c('2020-10-07', 'm.calderon', 'MOL-26 AuthGuard', take('src/app/core/guards/auth.guard.ts', 'src/app/core/guards/index.ts'))
c('2020-10-08', 'm.calderon', 'MOL-27 correlation id and bearer token interceptors',
  take('src/app/core/interceptors/correlation-id.interceptor.ts', 'src/app/core/interceptors/bearer-token.interceptor.ts', 'src/app/core/interceptors/index.ts'))
c('2020-10-09', 'd.okafor', 'MOL-29 BFF api base and models', take('src/app/core/api/api-base.ts', 'src/app/core/api/models.ts', 'src/app/core/api/index.ts'))
c('2020-10-12', 's.whitfield', 'MOL-31 shared module: pipes and layout helpers',
  take('src/app/shared/shared.module.ts', 'src/app/shared/pipes/*', 'src/app/shared/components/page-section/*', 'src/app/shared/components/loading-panel/*'))
c('2020-10-13', 's.whitfield', 'MOL-31 shared: empty state, error banner, directives',
  take('src/app/shared/components/empty-state/*', 'src/app/shared/components/error-banner/*', 'src/app/shared/directives/*'))
c('2020-10-14', 'c.mbeki', 'GIS-455 XSRF cookie and header names agreed with the BFF team')
c('2020-10-15', 'd.okafor', 'MOL-33 proxy config for local development against the BFF', take('proxy.conf.json'))
c('2020-10-16', 'd.okafor', 'MOL-34 accounts api service', take('src/app/core/api/accounts-api.service.ts'))
c('2020-10-19', 's.whitfield', 'MOL-36 masked number component', take('src/app/shared/components/masked-number/*'))

mod, store, ss, svc, comps, rest = feature_files('dashboard')
k = component_commits('dashboard', 40, dates_between('2020-10-20', '2020-11-13', 12), RD, mod, store, ss, svc, comps, rest, 'dashboard module, routing and store')
c('2020-11-16', 'd.okafor', 'Merge release/2020.11 into main for train 2020.11.2')
mod, store, ss, svc, comps, rest = feature_files('accounts')
k = component_commits('accounts', k + 5, dates_between('2020-11-17', '2020-12-11', 14), RD, mod, store, ss, svc, comps, rest, 'accounts module, routing and store')
c('2020-12-01', 'm.calderon', 'MOL-71 account details resolver', take('src/app/core/resolvers/account-details.resolver.ts', 'src/app/core/resolvers/accounts.resolver.ts', 'src/app/core/resolvers/index.ts'))
c('2020-12-14', 'd.okafor', 'Merge release/2020.12 into main for train 2020.12.1')
c('2020-12-15', 's.whitfield', 'MOL-88 fix transaction list page size reset on filter change')
c('2020-12-16', 'm.calderon', 'Revert "MOL-88 fix transaction list page size reset on filter change"', body='Broke the running balance column. Reapplying with a test in the new year.')

# ---------------------------------------------------------------- 2021: transfers, canopy, bill pay, cards, telemetry
c('2021-01-05', 's.whitfield', 'MOL-88 transaction list page size reset, with a spec this time')
c('2021-01-06', 'd.okafor', 'MOL-101 error model and RFC 7807 mapping interceptor',
  take('src/app/core/errors/app-error.model.ts', 'src/app/core/interceptors/error-mapping.interceptor.ts'))
c('2021-01-08', 'm.calderon', 'MOL-103 retry with backoff on idempotent BFF calls', take('src/app/core/interceptors/retry-backoff.interceptor.ts'))
c('2021-01-11', 'd.okafor', 'MOL-104 global error handler posting to Splunk HEC',
  take('src/app/core/errors/global-error.handler.ts', 'src/app/core/telemetry/splunk-logger.service.ts'))
c('2021-01-12', 'j.hollins', 'MOL-110 transfers api service and limits resolver',
  take('src/app/core/api/transfers-api.service.ts', 'src/app/core/resolvers/transfer-limits.resolver.ts'))
mod, store, ss, svc, comps, rest = feature_files('transfers')
k = component_commits('transfers', 112, dates_between('2021-01-13', '2021-03-05', 16), PAY + ['d.okafor'], mod, store, ss, svc, comps, rest, 'transfers module, routing and store')
c('2021-01-25', 'j.hollins', 'MOL-118 MfaStepUpGuard: fresh mfa_at claim above the transfer threshold', take('src/app/core/guards/mfa-step-up.guard.ts'),
  body='Threshold and claim age from runtime config. Redirects to Keystone with acr_values and a return url. KEY-402 for the mock.')
c('2021-01-28', 'v.orlova', 'GIS-610 never put the transfer amount in telemetry, band only')
c('2021-02-01', 'd.okafor', 'Merge release/2021.01 into main for train 2021.01.2')
c('2021-02-09', 'j.hollins', 'MOL-131 UnsavedChangesGuard on the transfer wizard', take('src/app/core/guards/unsaved-changes.guard.ts'))
c('2021-02-15', 'd.okafor', 'Merge release/2021.02 into main for train 2021.02.1')
c('2021-03-01', 'd.okafor', 'Merge release/2021.02 into main for train 2021.02.2')
c('2021-03-18', 's.whitfield', 'MOL-1188 ADR 0005: Angular Material through Canopy', take('docs/adr/0005-angular-material-through-canopy.md'))
c('2021-03-22', 's.whitfield', 'MOL-1188 adopt @meridian/canopy-ui 1.0.0, drop the MeridianStyle theme',
  take('src/styles/_material-icons.scss', 'src/assets/fonts/README.txt', 'src/assets/canopy/*'))
c('2021-03-23', 's.whitfield', 'MOL-1192 flex-layout for the dashboard and account grids')
c('2021-03-24', 'h.eriksen', 'CNPY-260 canopy 1.0.1: focus ring on cn-button', )
c('2021-03-29', 'd.okafor', 'Merge release/2021.03 into main for train 2021.03.2')
c('2021-04-06', 'm.calderon', 'MOL-1204 entitlements service from the id token', take('src/app/core/entitlements/entitlements.service.ts'))
c('2021-04-07', 'm.calderon', 'MOL-1205 LazyModuleGuard: CanLoad on transfers, bill pay and cards', take('src/app/core/guards/lazy-module.guard.ts'))
c('2021-04-08', 'p.venkatesan', 'MOL-1210 bill pay api service', take('src/app/core/api/bill-pay-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('bill-pay')
k = component_commits('bill-pay', 1211, dates_between('2021-04-09', '2021-05-14', 10), PAY, mod, store, ss, svc, comps, rest, 'bill pay module, routing and store')
c('2021-04-26', 'd.okafor', 'Merge release/2021.04 into main for train 2021.04.2')
c('2021-05-10', 'd.okafor', 'Merge release/2021.05 into main for train 2021.05.1')
c('2021-05-17', 'b.arceneaux', 'MOL-1240 cards api service', take('src/app/core/api/cards-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('cards')
k = component_commits('cards', 1241, dates_between('2021-05-18', '2021-06-18', 9), RD, mod, store, ss, svc, comps, rest, 'cards module, routing and store')
c('2021-05-24', 'd.okafor', 'Merge release/2021.05 into main for train 2021.05.2')
c('2021-06-02', 'f.adeyemi', 'MOL-1260 Lantern product analytics via @meridian/lantern-sdk',
  take('src/app/core/telemetry/lantern.service.ts', 'src/assets/vendor/lantern-snippet.js'),
  body='SDK is View Engine; ngcc postinstall added. LNTN-88 for an Ivy build.')
c('2021-06-03', 'f.adeyemi', 'MOL-1260 feature flags from Semaphore and FeatureFlagGuard',
  take('src/app/core/flags/*', 'src/app/core/guards/feature-flag.guard.ts'))
c('2021-06-07', 'd.okafor', 'Merge release/2021.06 into main for train 2021.06.1')
c('2021-06-14', 'v.orlova', 'GIS-702 bearer token only on BFF and Semaphore hosts, never the Lantern collector')
c('2021-06-21', 'd.okafor', 'Merge release/2021.06 into main for train 2021.06.2')
c('2021-07-05', 'b.arceneaux', 'MOL-1290 statements api service', take('src/app/core/api/statements-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('statements')
k = component_commits('statements', 1291, dates_between('2021-07-06', '2021-07-30', 7), RD, mod, store, ss, svc, comps, rest, 'statements module, routing and store')
c('2021-07-19', 'd.okafor', 'Merge release/2021.07 into main for train 2021.07.2')
c('2021-08-02', 'm.calderon', 'MOL-1310 alerts api service', take('src/app/core/api/alerts-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('alerts')
k = component_commits('alerts', 1311, dates_between('2021-08-03', '2021-09-03', 9), RD, mod, store, ss, svc, comps, rest, 'alerts module, routing and store')
c('2021-08-16', 'd.okafor', 'Merge release/2021.08 into main for train 2021.08.1')
c('2021-08-30', 'd.okafor', 'Merge release/2021.08 into main for train 2021.08.2')
c('2021-09-06', 'd.okafor', 'MOL-1330 profile api service', take('src/app/core/api/profile-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('profile')
k = component_commits('profile', 1331, dates_between('2021-09-07', '2021-10-15', 11), RD, mod, store, ss, svc, comps, rest, 'profile and security module, routing and store')
c('2021-09-13', 'd.okafor', 'Merge release/2021.09 into main for train 2021.09.1')
c('2021-09-27', 'd.okafor', 'Merge release/2021.09 into main for train 2021.09.2')
c('2021-10-04', 'm.calderon', 'MOL-1350 idle timeout with ng-idle, warning at 8 minutes')
c('2021-10-11', 'd.okafor', 'Merge release/2021.10 into main for train 2021.10.1')
IDLE = f'{RW}/src/app/core/session/idle-timeout.service.ts'
IDLE_FIX_IMPORT = ["import { filter, map, switchMap, takeWhile, throttleTime } from 'rxjs/operators';",
                   "import { map, switchMap, takeWhile, throttleTime } from 'rxjs/operators';"]
IDLE_FIX_PIPE = ['''        .pipe(
          throttleTime(1000),
          // Once the warning is up only an explicit extend() counts; a stray keypress on the dialog
          // (Escape, Tab) must not keep the session alive. INC-2024-0912.
          filter(() => this.state !== 'warning')
        )
''', '''        .pipe(throttleTime(1000))
''']
IDLE_FIX_DOC = [''' activity, and customers came back to a still-open session after lunch. Tightened again after
 * INC-2024-0912 (MOL-4412), when Escape on the warning dialog turned out to reset the timer. The
 * rule now is simple.''', ''' activity, and customers came back to a still-open session after lunch. The
 * rule now is simple.''']
idle_final = (ROOT / IDLE).read_text()
idle_early = idle_final
for new, old in (IDLE_FIX_IMPORT, IDLE_FIX_PIPE, IDLE_FIX_DOC):
    assert new in idle_early, new
    idle_early = idle_early.replace(new, old)
assigned.add(IDLE)
c('2021-10-19', 'm.calderon', 'MOL-1362 idle timeout rewritten on RxJS timers, ng-idle removed',
  take('src/app/shell/idle-warning-dialog/*'), content={IDLE: idle_early},
  body='ng-idle disagreed with zone.js 0.11.4 and fired the warning twice. An afternoon on fromEvent + timer and we own it.')
c('2021-10-25', 'd.okafor', 'Merge release/2021.10 into main for train 2021.10.2')
c('2021-11-08', 'c.mbeki', 'GIS-881 tokens in session storage, not local storage (INC-2021-1140)', take('src/app/core/auth/keystone-storage.ts'),
  body='Shared branch kiosks kept a customer signed in across users. GIS-STD-021 now requires session scope. ADR 0008.')
c('2021-11-09', 'd.okafor', 'Merge hotfix/MOL-1401-session-storage into main for train 2021.11.1')
c('2021-11-22', 'd.okafor', 'Merge release/2021.11 into main for train 2021.11.2')
c('2021-12-06', 's.whitfield', 'MOL-1420 selective preloading for dashboard-adjacent modules', take('src/app/core/routing/selective-preloading.strategy.ts'))
c('2021-12-07', 'd.okafor', 'Merge release/2021.12 into main for train 2021.12.1')
c('2021-12-13', 'c.mbeki', 'GIS-902 data classification for the web tier', take('DATA_CLASSIFICATION.md'))

# ---------------------------------------------------------------- 2022: remaining features, i18n, sw, Angular 13 and 14
c('2022-01-10', 'd.okafor', 'Merge release/2022.01 into main for train 2022.01.1')
c('2022-01-11', 'b.arceneaux', 'MOL-1440 messages api service', take('src/app/core/api/messages-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('messages')
k = component_commits('messages', 1441, dates_between('2022-01-12', '2022-02-04', 6), RD, mod, store, ss, svc, comps, rest, 'secure messages module, routing and store')
c('2022-01-24', 'd.okafor', 'Merge release/2022.01 into main for train 2022.01.2')
c('2022-02-07', 's.whitfield', 'MOL-1460 ADR 0009: $localize for templates, ngx-translate for CMS content')
c('2022-02-08', 's.whitfield', 'MOL-1460 locale service, translate loader and en/es runtime catalogs',
  take('src/app/core/i18n/*', 'src/assets/i18n/*'))
c('2022-02-09', 's.whitfield', 'MOL-1460 extract-i18n target and the first messages.xlf', take('src/locale/messages.xlf'))
c('2022-02-14', 'd.okafor', 'Merge release/2022.02 into main for train 2022.02.1')
c('2022-02-21', 'b.arceneaux', 'MOL-1470 rewards api service', take('src/app/core/api/rewards-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('rewards')
k = component_commits('rewards', 1471, dates_between('2022-02-22', '2022-03-11', 5), RD, mod, store, ss, svc, comps, rest, 'rewards module behind Semaphore flag')
c('2022-02-28', 'd.okafor', 'Merge release/2022.02 into main for train 2022.02.2')
c('2022-03-14', 'd.okafor', 'Merge release/2022.03 into main for train 2022.03.1')
mod, store, ss, svc, comps, rest = feature_files('onboarding')
k = component_commits('onboarding', 1480, dates_between('2022-03-15', '2022-04-22', 7), RD, mod, store, ss, svc, comps, rest, 'onboarding module: open an account')
c('2022-03-28', 'd.okafor', 'Merge release/2022.03 into main for train 2022.03.2')
c('2022-04-11', 'd.okafor', 'Merge release/2022.04 into main for train 2022.04.1')
c('2022-04-25', 'd.okafor', 'Merge release/2022.04 into main for train 2022.04.2')
c('2022-05-02', 'm.calderon', 'MOL-1510 content api for help and disclosures', take('src/app/core/api/content-api.service.ts'))
mod, store, ss, svc, comps, rest = feature_files('help')
k = component_commits('help', 1511, dates_between('2022-05-03', '2022-05-13', 3), RD, mod, store, ss, svc, comps, rest, 'help module')
mod, store, ss, svc, comps, rest = feature_files('disclosures')
k = component_commits('disclosures', 1520, dates_between('2022-05-16', '2022-05-20', 3), RD, mod, store, ss, svc, comps, rest, 'disclosures module')
mod, store, ss, svc, comps, rest = feature_files('errors')
k = component_commits('errors', 1525, dates_between('2022-05-23', '2022-05-27', 3), RD, mod, store, ss, svc, comps, rest, 'error pages: not found, forbidden, maintenance')
c('2022-05-30', 'd.okafor', 'Merge release/2022.05 into main for train 2022.05.2')
c('2022-06-06', BOT, 'MOL-1530 bump @angular/* 12.2.16 to 12.2.17')
c('2022-06-13', 'd.okafor', 'Merge release/2022.06 into main for train 2022.06.1')
c('2022-06-20', 'm.calderon', 'MOL-1540 ng update to Angular 13', body='Two days. Canopy 2.0 landed the week before. View Engine libs now need ngcc at install; Lantern still is one.')
c('2022-06-21', 'm.calderon', 'MOL-1540 fix specs after Angular 13: TestBed teardown flag')
c('2022-06-27', 'd.okafor', 'Merge release/2022.06 into main for train 2022.06.2')
c('2022-07-11', 'd.okafor', 'Merge release/2022.07 into main for train 2022.07.1')
c('2022-07-18', 's.whitfield', 'MOL-1555 prettier sweep, no functional change')
c('2022-07-25', 'd.okafor', 'Merge release/2022.07 into main for train 2022.07.2')
c('2022-08-08', 'b.arceneaux', 'MOL-1570 service worker for the shell, ngsw-config', take('ngsw-config.json', 'src/manifest.webmanifest', 'src/app/shell/sw-update-banner/*'),
  body='ADR 0010. Shell and fonts only; reference data with freshness, customer data network-first.')
c('2022-08-09', 'c.mbeki', 'GIS-1102 CSP meta tag, no unsafe-inline for scripts')
c('2022-08-15', 'd.okafor', 'Merge release/2022.08 into main for train 2022.08.1')
c('2022-08-22', 'f.adeyemi', 'MOL-1580 web vitals reporter to Splunk', take('src/app/core/telemetry/web-vitals.reporter.ts'))
c('2022-08-29', 'd.okafor', 'Merge release/2022.08 into main for train 2022.08.2')
c('2022-09-05', BOT, 'MOL-1590 bump @ngx-translate/core 13.0.0 to 14.0.0')
c('2022-09-12', 'd.okafor', 'Merge release/2022.09 into main for train 2022.09.1')
c('2022-09-19', 'm.calderon', 'MOL-1600 aot false in the development configuration', body='ng serve rebuild was 70s on the Plano laptops. Prod stays AOT; the PR job runs a prod build.')
c('2022-09-26', 'd.okafor', 'Merge release/2022.09 into main for train 2022.09.2')
c('2022-10-10', 'd.okafor', 'Merge release/2022.10 into main for train 2022.10.1')
c('2022-10-17', 'v.orlova', 'GIS-1180 forbidden names check as a pre-commit hook')
c('2022-10-24', 'd.okafor', 'Merge release/2022.10 into main for train 2022.10.2')
c('2022-11-01', 'm.calderon', 'MOL-2950 ng update to Angular 14 and Node 16', patch={f'{RW}/.nvmrc': [['14.21.3', '16.20.2']]},
  body='ADR 0011. Canopy 3.5 lagged Material 14 by five weeks. Forms migration left UntypedFormBuilder in profile and onboarding; see MOL-2960.')
c('2022-11-02', 'm.calderon', 'MOL-2950 fix zone.js 0.11.8 fakeAsync regressions in 40 specs')
c('2022-11-03', BOT, 'MOL-2951 bump @ngrx/* 13.2.0 to 14.3.3')
c('2022-11-04', BOT, 'MOL-2952 bump @angular/flex-layout 13.0.0-beta.38 to 14.0.0-beta.41')
c('2022-11-07', BOT, 'MOL-2953 bump angular-oauth2-oidc 13.0.1 to 14.0.1')
c('2022-11-08', 'm.calderon', 'MOL-2954 pin @types/node to 16.18.11', body='Newer 16.x ships Disposable declarations TS 4.7 cannot parse. TS2304 on a clean install.')
c('2022-11-14', 'd.okafor', 'Merge release/2022.11 into main for train 2022.11.1')
c('2022-11-21', 'b.arceneaux', 'MOL-2965 typed forms in transfers and bill pay; profile and onboarding stay untyped')
c('2022-11-28', 'd.okafor', 'Merge release/2022.11 into main for train 2022.11.2')
c('2022-12-05', 'c.mbeki', 'GIS-1340 npm overrides for minimist and loader-utils advisories', body='Transitive via the CLI toolchain. Pinned pending an upstream release; GIS-1340 tracks the two advisories.')
c('2022-12-12', 'd.okafor', 'Merge release/2022.12 into main for train 2022.12.1')

# ---------------------------------------------------------------- 2023: maintenance, e2e death, iris out, ngsw incident
c('2023-01-09', 'd.okafor', 'Merge release/2023.01 into main for train 2023.01.1')
c('2023-01-16', 'w.tanaka', 'MOL-2960 ADR 0012: untyped forms retained in profile and onboarding')
c('2023-01-23', 'd.okafor', 'Merge release/2023.01 into main for train 2023.01.2')
c('2023-02-06', 'b.arceneaux', 'MOL-3010 protractor page objects for dashboard and transfers', take('e2e/**'))
c('2023-02-13', 'd.okafor', 'Merge release/2023.02 into main for train 2023.02.1')
c('2023-02-27', 'd.okafor', 'Merge release/2023.02 into main for train 2023.02.2')
c('2023-03-06', BOT, 'MOL-3020 bump rxjs 7.5.6 to 7.5.7')
c('2023-03-13', 'd.okafor', 'Merge release/2023.03 into main for train 2023.03.1')
c('2023-03-20', 'e.castellanos', 'TOOL-1120 Jenkins agents to nodejs16-rhel8; e2e stage disabled (MOL-3644)')
c('2023-03-27', 'd.okafor', 'Merge release/2023.03 into main for train 2023.03.2')
c('2023-04-10', 'd.okafor', 'Merge release/2023.04 into main for train 2023.04.1')
c('2023-04-17', 's.whitfield', 'MOL-3102 fxLayout.lt-md column stacking on the transfer wizard for phones')
c('2023-04-24', 'd.okafor', 'Merge release/2023.04 into main for train 2023.04.2')
c('2023-05-08', 'd.okafor', 'Merge release/2023.05 into main for train 2023.05.1')
c('2023-05-15', 'm.calderon', 'MOL-3122 Spanish translations from the vendor, merge script', take('tools/i18n/*', 'src/locale/messages.es.xlf'))
c('2023-05-16', 'm.calderon', 'MOL-3122 es locale in angular.json, localized production build')
c('2023-05-22', 'd.okafor', 'Merge release/2023.05 into main for train 2023.05.2')
c('2023-06-05', 'd.okafor', 'Merge release/2023.06 into main for train 2023.06.1')
c('2023-06-12', 'w.tanaka', 'MOL-3290 architecture overview and diagram', take('docs/architecture.md'))
c('2023-06-19', 'd.okafor', 'Merge release/2023.06 into main for train 2023.06.2')
c('2023-07-03', 'd.okafor', 'Merge release/2023.07 into main for train 2023.07.1')
c('2023-07-10', 'p.venkatesan', 'MOL-3310 fix service worker update loop when ngsw.json 404s')
c('2023-07-17', 'd.okafor', 'Merge release/2023.07 into main for train 2023.07.2')
c('2023-07-31', 'd.okafor', 'Merge release/2023.07 into main for train 2023.07.3')
c('2023-08-14', 'd.okafor', 'Merge release/2023.08 into main for train 2023.08.1')
c('2023-08-21', BOT, 'MOL-3350 bump @meridian/canopy-ui 3.6.1 to 3.7.2')
c('2023-08-28', 'd.okafor', 'Merge release/2023.08 into main for train 2023.08.2')
c('2023-09-11', 'b.arceneaux', 'MOL-3410 remove the Iris chat widget; now loaded from the CDN by iris-widget')
c('2023-09-12', 'd.okafor', 'Merge release/2023.09 into main for train 2023.09.1')
c('2023-09-18', 'd.okafor', 'MOL-3420 INC-2023-0917 ngsw.json referenced a renamed bundle; verify script', take('tools/verify-ngsw.js'))
c('2023-09-19', 'd.okafor', 'Merge hotfix/MOL-3420-ngsw-manifest into main for train 2023.09.2')
c('2023-10-02', 'd.okafor', 'Merge release/2023.10 into main for train 2023.10.1')
c('2023-10-09', 'a.balaraman', 'MOL-3444 http cache interceptor for reference data, opt-in per request', take('src/app/core/interceptors/http-cache.interceptor.ts'))
c('2023-10-16', 'd.okafor', 'Merge release/2023.10 into main for train 2023.10.2')
c('2023-10-30', 'd.okafor', 'Merge release/2023.10 into main for train 2023.10.3')
c('2023-11-06', 'e.castellanos', 'TOOL-1290 sonar and checkmarx project config', take('sonar-project.properties', 'checkmarx.yml', '.dockerignore', '.gitattributes', '.eslintrc.json'))
c('2023-11-13', 'd.okafor', 'Merge release/2023.11 into main for train 2023.11.1')
c('2023-11-20', 'm.calderon', 'MOL-3480 guard and interceptor specs',
  take('src/app/core/guards/*.spec.ts', 'src/app/core/interceptors/*.spec.ts', 'src/testing/test-config.ts'))
c('2023-11-21', 'm.calderon', 'MOL-3480 session reducer spec', take('src/app/core/store/session/session.reducer.spec.ts', 'src/app/app.component.spec.ts'))
c('2023-11-27', 'd.okafor', 'Merge release/2023.11 into main for train 2023.11.2')
c('2023-12-11', 'd.okafor', 'Merge release/2023.12 into main for train 2023.12.1')
c('2023-12-12', 's.whitfield', 'MOL-3495 tools: feature scaffolder and spec', take('tools/scaffold-feature.js', 'tools/feature-spec.json'))

# ---------------------------------------------------------------- 2024: spike, ADR, hotfix, backlog
c('2024-01-08', 'd.okafor', 'Merge release/2024.01 into main for train 2024.01.1')
c('2024-01-22', 'd.okafor', 'Merge release/2024.01 into main for train 2024.01.2')
c('2024-02-05', 'd.okafor', 'Merge release/2024.02 into main for train 2024.02.1')
c('2024-02-19', 'd.okafor', 'Merge release/2024.02 into main for train 2024.02.2')
c('2024-02-26', 'b.arceneaux', 'MOL-3801 spike notes from the Angular 15 attempt, cherry-picked from the spike branch',
  content={f'{RW}/SPIKE_NOTES.md': None})  # filled in below
c('2024-03-04', 'd.okafor', 'Merge release/2024.03 into main for train 2024.03.1')
c('2024-03-11', BOT, 'MOL-3820 bump @meridian/lantern-sdk 2.3.0 to 2.4.1')
c('2024-03-18', 'd.okafor', 'Merge release/2024.03 into main for train 2024.03.2')
c('2024-03-21', 'd.okafor', 'MOL-3830 INC-2024-0388 rollback runbook after the ngsw mismatch', take('docs/runbooks/rollback-failed-deploy.md'))
c('2024-04-01', 'd.okafor', 'Merge release/2024.04 into main for train 2024.04.1')
c('2024-04-15', 'd.okafor', 'Merge release/2024.04 into main for train 2024.04.2')
c('2024-04-29', 'd.okafor', 'Merge release/2024.04 into main for train 2024.04.3')
c('2024-05-13', 'd.okafor', 'Merge release/2024.05 into main for train 2024.05.1')
c('2024-05-20', 's.whitfield', 'MOL-3880 masked number: aria label and copy-to-clipboard')
c('2024-05-27', 'd.okafor', 'Merge release/2024.05 into main for train 2024.05.2')
c('2024-06-10', 'd.okafor', 'Merge release/2024.06 into main for train 2024.06.1')
c('2024-06-24', 'd.okafor', 'Merge release/2024.06 into main for train 2024.06.2')
c('2024-06-27', 'w.tanaka', 'MOL-4471 ADR 0014: defer the Angular upgrade', content={f'{RW}/docs/adr/0014-defer-angular-upgrade-2024.md': None, f'{RW}/docs/adr/README.md': None})
c('2024-07-01', 'd.okafor', 'MOL-4471 epic and child stories', take('backlog/**'))
c('2024-07-01', 'b.arceneaux', 'MOL-3801 spike notes: ADR 0014 accepted',
  patch={f'{RW}/SPIKE_NOTES.md': [['Do not rebase it onto anything.\n', 'Do not rebase it onto anything.\n\n2024-06: ADR 0014 accepted, deferred to 2025. Epic MOL-4471.\n']]})
c('2024-07-08', 'd.okafor', 'Merge release/2024.07 into main for train 2024.07.1')
c('2024-07-22', 'd.okafor', 'Merge release/2024.07 into main for train 2024.07.2')
c('2024-08-05', 'd.okafor', 'Merge release/2024.08 into main for train 2024.08.1')
c('2024-08-12', BOT, 'MOL-4390 bump @types/jasmine 4.0.3 to 4.3.6')
c('2024-08-19', 'd.okafor', 'Merge release/2024.08 into main for train 2024.08.2')
c('2024-09-02', 'd.okafor', 'Merge release/2024.09 into main for train 2024.09.1')
c('2024-09-10', 'm.calderon', 'MOL-4412 idle warning dismissed with Escape no longer resets the timer',
  patch={IDLE: [[old, new] for new, old in (IDLE_FIX_IMPORT, IDLE_FIX_PIPE, IDLE_FIX_DOC)]},
  body='INC-2024-0912. Escape on the warning dialog counted as activity and extended the session indefinitely. Sev 2, contact centre reports.')
c('2024-09-10', 'v.orlova', 'GIS-2311 review of MOL-4412: logout must still fire at 10 minutes with the dialog open')
c('2024-09-11', 'd.okafor', 'Merge hotfix/MOL-4412-session-timeout into main for train 2024.09.2')
c('2024-09-16', 'd.okafor', 'Merge release/2024.09 into main for train 2024.09.3')
c('2024-09-30', 'd.okafor', 'Merge release/2024.09 into main for train 2024.09.4')
c('2024-10-14', 'd.okafor', 'Merge release/2024.10 into main for train 2024.10.1')
c('2024-10-28', 'd.okafor', 'Merge release/2024.10 into main for train 2024.10.2')
c('2024-11-11', 'd.okafor', 'Merge release/2024.11 into main for train 2024.11.1')
c('2024-11-18', 'w.tanaka', 'MOL-4471 ADR 0014: deferred again in Q4 planning',
  patch={f'{RW}/docs/adr/0014-defer-angular-upgrade-2024.md': [['flex-layout with visual regression, then the framework itself.\n',
    'flex-layout with visual regression, then the framework itself.\n\n2024-11 update: deferred again in the Q4 planning session, target moved to Q3 2025. Ledgerline\ncut-over consumed the capacity as expected. MOL-4471 remains open.\n']]})
c('2024-11-25', 'd.okafor', 'Merge release/2024.11 into main for train 2024.11.2')
c('2024-12-09', 'd.okafor', 'Merge release/2024.12 into main for train 2024.12.1')
c('2024-12-16', 'd.okafor', 'MOL-4490 README rewrite for the new joiners', take('README.md'))

# ---------------------------------------------------------------- 2025 and 2026: maintenance
c('2025-01-13', 'd.okafor', 'Merge release/2025.01 into main for train 2025.01.1')
c('2025-01-14', 'b.arceneaux', 'MOL-3801 spike notes: still deferred',
  patch={f'{RW}/SPIKE_NOTES.md': [['Epic MOL-4471.\n', 'Epic MOL-4471.\n2025-01: still deferred. Someone asked again. Read the above.\n']]})
c('2025-01-27', 'd.okafor', 'Merge release/2025.01 into main for train 2025.01.2')
c('2025-02-10', 'd.okafor', 'Merge release/2025.02 into main for train 2025.02.1')
c('2025-02-17', 'p.venkatesan', 'MOL-4188 quick transfer threshold from runtime config; spec xit pending fixture update')
c('2025-02-24', 'd.okafor', 'Merge release/2025.02 into main for train 2025.02.2')
c('2025-03-10', 'd.okafor', 'Merge release/2025.03 into main for train 2025.03.1')
c('2025-03-17', BOT, 'MOL-4505 bump @meridian/domain-fixtures 1.5.2 to 1.6.0')
c('2025-03-24', 'd.okafor', 'Merge release/2025.03 into main for train 2025.03.2')
c('2025-04-07', 'd.okafor', 'Merge release/2025.04 into main for train 2025.04.1')
c('2025-04-14', 'b.arceneaux', 'MOL-4402 card reveal spec xit: Keystone mock mfa_at in milliseconds')
c('2025-04-21', 'd.okafor', 'Merge release/2025.04 into main for train 2025.04.2')
c('2025-05-05', 'd.okafor', 'Merge release/2025.05 into main for train 2025.05.1')
c('2025-05-19', 'd.okafor', 'Merge release/2025.05 into main for train 2025.05.2')
c('2025-06-02', 'd.okafor', 'Merge release/2025.06 into main for train 2025.06.1')
c('2025-06-09', 's.whitfield', 'MOL-4530 statement viewer: blob frame-src in CSP for in-page PDFs')
c('2025-06-16', 'd.okafor', 'Merge release/2025.06 into main for train 2025.06.2')
c('2025-07-07', 'd.okafor', 'Merge release/2025.07 into main for train 2025.07.1')
c('2025-07-14', 'c.mbeki', 'GIS-2207 compensating controls re-review, no change')
c('2025-07-21', 'd.okafor', 'Merge release/2025.07 into main for train 2025.07.2')
c('2025-08-04', 'd.okafor', 'Merge release/2025.08 into main for train 2025.08.1')
c('2025-08-18', 'd.okafor', 'Merge release/2025.08 into main for train 2025.08.2')
c('2025-09-08', 'd.okafor', 'Merge release/2025.09 into main for train 2025.09.1')
c('2025-09-15', 'm.calderon', 'MOL-4560 coverage denominator: include untested sources in the karma bundle (MOL-2911)')
c('2025-09-22', 'd.okafor', 'Merge release/2025.09 into main for train 2025.09.2')
c('2025-10-06', 'd.okafor', 'Merge release/2025.10 into main for train 2025.10.1')
c('2025-10-20', 'd.okafor', 'Merge release/2025.10 into main for train 2025.10.2')
c('2025-11-03', 'd.okafor', 'Merge release/2025.11 into main for train 2025.11.1')
c('2025-11-10', 'j.hollins', 'MOL-4588 travel notice posts a single destination string, matching the BFF')
c('2025-11-17', 'd.okafor', 'Merge release/2025.11 into main for train 2025.11.2')
c('2025-12-01', 'd.okafor', 'Merge release/2025.12 into main for train 2025.12.1')
c('2026-01-12', 'd.okafor', 'Merge release/2026.01 into main for train 2026.01.1')
c('2026-01-26', 'd.okafor', 'Merge release/2026.01 into main for train 2026.01.2')
c('2026-02-09', 'd.okafor', 'Merge release/2026.02 into main for train 2026.02.1')
c('2026-02-16', 's.whitfield', 'MOL-4610 prettier sweep on features/, no functional change')
c('2026-02-23', 'd.okafor', 'Merge release/2026.02 into main for train 2026.02.2')
c('2026-03-09', 'd.okafor', 'Merge release/2026.03 into main for train 2026.03.1')
c('2026-03-23', 'd.okafor', 'Merge release/2026.03 into main for train 2026.03.2')
c('2026-04-06', 'd.okafor', 'Merge release/2026.04 into main for train 2026.04.1')
c('2026-04-13', 'b.arceneaux', 'MOL-4633 paperless toggle rollback on BFF failure')
c('2026-04-20', 'd.okafor', 'Merge release/2026.04 into main for train 2026.04.2')
c('2026-05-04', 'd.okafor', 'Merge release/2026.05 into main for train 2026.05.1')
c('2026-05-18', 'd.okafor', 'Merge release/2026.05 into main for train 2026.05.2')
c('2026-06-01', 'd.okafor', 'Merge release/2026.06 into main for train 2026.06.1')
c('2026-06-08', 'v.orlova', 'GIS-2490 verify-ngsw handles the localised baseHref')
c('2026-06-15', 'd.okafor', 'Merge release/2026.06 into main for train 2026.06.2')
c('2026-07-06', 'd.okafor', 'Merge release/2026.07 into main for train 2026.07.1')
c('2026-07-20', 'd.okafor', 'Merge release/2026.07 into main for train 2026.07.2')
c('2026-08-03', 'd.okafor', 'Merge release/2026.08 into main for train 2026.08.1')
c('2026-08-10', 'm.calderon', 'MOL-4650 lint: negated async pipes and unused imports')
c('2026-08-17', 'd.okafor', 'Merge release/2026.08 into main for train 2026.08.2')
c('2026-08-25', 'd.okafor', 'MOL-4655 cut release/2026.09 from develop')

# Anything not yet assigned goes into the last non-merge commit that fits.
leftover = [t for t in tracked if t not in assigned and not any(t in (e.get('content') or {}) or t in (e.get('patch') or {}) for e in commits)]
if leftover:
    c('2026-08-27', 'd.okafor', 'MOL-4658 housekeeping before the 2026.09 freeze', leftover)

# Early versions of files that are patched later.
final_spike = (ROOT / RW / 'SPIKE_NOTES.md').read_text()
early_spike = final_spike.replace('\n2024-06: ADR 0014 accepted, deferred to 2025. Epic MOL-4471.\n2025-01: still deferred. Someone asked again. Read the above.\n', '')
assert early_spike != final_spike
final_adr = (ROOT / RW / 'docs/adr/0014-defer-angular-upgrade-2024.md').read_text()
early_adr = final_adr.replace('\n2024-11 update: deferred again in the Q4 planning session, target moved to Q3 2025. Ledgerline\ncut-over consumed the capacity as expected. MOL-4471 remains open.\n', '')
assert early_adr != final_adr
for entry in commits:
    if 'content' in entry:
        for k2 in list(entry['content']):
            if entry['content'][k2] is None:
                if k2.endswith('SPIKE_NOTES.md'):
                    entry['content'][k2] = early_spike
                elif k2.endswith('0014-defer-angular-upgrade-2024.md'):
                    entry['content'][k2] = early_adr
                elif k2.endswith('adr/README.md'):
                    entry['content'][k2] = (ROOT / RW / 'docs/adr/README.md').read_text()

# Release manager rotates; spread the merge commits over the leads.
rm_cycle = ['d.okafor', 'm.calderon', 's.whitfield', 'd.okafor', 'b.arceneaux', 'm.calderon']
for i, entry in enumerate([e for e in commits if e['message'].startswith('Merge release/')]):
    entry['author'] = rm_cycle[(i // 3) % len(rm_cycle)]
print('leftover:', leftover)
# sort by date, stable
commits.sort(key=lambda e: e['date'])
manifest = {'component': RW, 'commits': commits}
out = Path(__file__).resolve().parent / 'manifest.json'
out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n')
print(len(commits), 'commits;', len(leftover), 'leftover files')
