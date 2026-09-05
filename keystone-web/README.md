# keystone-web

Login, MFA, device trust, step-up and account recovery for every Meridian digital channel. Served
at `login.meridiantrust.example`. This is the relying-party UI in front of the Keystone identity
provider; it does not issue tokens, it does not validate them, and it does not know who you are
after the redirect. Retail, Business, Ledgerline and the contact centre desktop all bounce through
here, which is why a bad deploy of this thing is a P1 for the whole bank (INC0142270, March 2023,
do not ask).

Owner: `@meridian/identity-platform` (Chester). On-call rota `IDP-WEB` in the paging tool; the
pager is shared with the Keystone IdP team, so say "front end" in the first sentence. Security
review: `@meridian/gis-appsec` for anything under `src/app/core/auth`, `src/app/core/device`,
`src/index.html` (CSP) and the pipeline files — see CODEOWNERS.

## Versions

| | |
|---|---|
| Angular | 15.2.10 (CLI 15.2.11) |
| Angular Material / CDK | 15.2.9, **mixed legacy and MDC** - see below |
| TypeScript | 4.9.5 |
| RxJS | 7.8.0 |
| zone.js | 0.12.0 |
| angular-oauth2-oidc | 15.0.1 |
| @meridian/canopy-ui | 3.6.1 |
| Node | 16.20.2 (`.nvmrc`) |

Do not bump anything without reading `docs/adr/0003-material-15-mdc-migration.md` first. The
Angular 15 upgrade landed in KEY-2172 (January 2024) and took eleven weeks against a two week
estimate, mostly because of Material.

## The Material situation, read this before touching a template

Angular 15 renamed every Material component. The old ones became `MatLegacy*` in
`@angular/material/legacy-*` and the new MDC based ones took the old names. Both are installed,
both are themed (`src/styles/_theme.scss` includes `all-legacy-component-themes` *and*
`all-component-themes`, yes, we know) and which one a screen uses depends on whether anyone got to
it during KEY-2210.

Roughly:

- **Still legacy**: `LoginModule` (the credential form, the actual login page everyone hits),
  `MfaModule` (OTP challenge, channel picker, push, authenticator), `StepUpModule`,
  `BusyOverlayComponent`. All go through `SharedLegacyModule` / `LegacyMaterialModule`.
- **On MDC**: everything standalone - the OTP input, device trust, recovery, maintenance notice,
  brand header, footer, rate limit banner - and the session pages. These import from
  `@angular/material/<name>` directly or through `MaterialModule`.

The legacy entry points are deleted in Angular 17. There is no v16 target for this app either,
because v16 is where the legacy modules start emitting deprecation output that our lint treats as
an error. KEY-2210 was opened to finish the job, got half done on
`feature/KEY-2210-mdc-migration`, and that branch has not built since March 2024. It is still
there. Someone should either finish it or delete it; the person who started it moved to Payments.

The visual reason it stalled: MDC form fields are 8px taller and the legacy checkbox ripple does
not exist on MDC, so the credential form (the single most screenshotted page in the bank, in every
contact centre script) moves. Brand sign-off is required for that page (KEY-0471) and was not
obtained.

## Running locally

```
nvm use
npm ci
npm start          # ng serve on 4202
```

You need the IdP mock and, optionally, the retail BFF:

```
# from the estate root
mock-external/estate-up.sh keystone-idp-mock       # 4400
# bff-retail on 4515 if you have platform-services built; otherwise the app falls back to
# local behaviour for device trust and recovery (see DeviceTrustService, RecoveryService).
```

Then open `http://localhost:4202/`. The login page starts the authorization code flow against
`http://localhost:4400`, the mock renders its own login form, posts back to us... no it does not,
we post to it. Read `docs/runbooks/local-login-flow.md`; the sequence is not obvious and the mock
issues a 303 that XHR follows silently.

Test users are in `mock-external/keystone-idp-mock/src/users.ts`. The fixed OTP is in the same
directory. `@meridian/domain-fixtures` supplies everything else; do not add users of your own.

Registry: `.npmrc` points `@meridian` at the local Verdaccio on 4873. Publish Canopy first with
`canopy-ui/scripts/publish-local-versions.sh` or `npm ci` will fail on `@meridian/canopy-ui@3.6.1`.

## Scripts

| | |
|---|---|
| `npm start` | dev server, 4202 |
| `npm run build` / `npm run build:prod` | `dist/keystone-web` |
| `npm test` | Karma, ChromeHeadless, coverage in `coverage/keystone-web` |
| `npm run lint` | angular-eslint |
| `npm run csp:check` | greps the built `index.html` for `unsafe-inline` and fails if found. Runs in the pipeline after build. |

`CHROME_BIN` must point at a Chrome or Chromium if the default resolution in `karma.conf.js`
does not find one.

## Layout

```
src/app/core/         auth (OIDC config, session, IdP client, MFA txn state, step-up, recovery)
                      device (fingerprint, trust), http (correlation, rate limit), telemetry
src/app/shared/       Material re-export modules (legacy and MDC), brand header, footer, banners
src/app/features/     login, mfa, device-trust, step-up, recovery, session
src/styles/           tokens, theme (both Material theme mixins), global
docs/                 ADRs, runbooks, the fraud requirements for device trust
helm/                 in-repo chart; platform-tooling/helm/keystone-web is the deployed one
```

## Security posture, short version

Long version in `SECURITY.md` and `docs/adr/0002-oidc-code-flow-pkce.md`.

- Authorization code + PKCE via `angular-oauth2-oidc`. Public client `keystone-web`. No implicit
  flow, no silent refresh iframe, no tokens in storage. The library does the exchange and the
  validation; we read `sub`, `mfa_at`, `acr` and `amr` off the validated claims and nothing else.
- Passwords exist in exactly one place: `CredentialFormComponent`, which hands them to
  `IdpClientService.submitCredentials` and clears the control. Nothing logs the form value. GIS
  check this in every release review (GIS-1490).
- Device fingerprint is SHA-256 over eight `navigator`/`screen` properties agreed with Fraud and
  Privacy. `docs/fraud-device-trust-requirements.md` has the list and the tickets. Trust state is
  a BFF-managed HttpOnly cookie; nothing about the device is stored in the browser by us.
- CSP in `index.html` has no `unsafe-inline` anywhere. The nginx config repeats it as a header.
  Material's inline styles work because Angular 15 does not inject `<style>` tags at runtime for
  component styles when built for production - it did in 14 with `styles: []`, which is the
  original reason this app skipped the interim CSP relaxation everyone else got.
- 429 from the IdP shows `RateLimitBannerComponent` with `Retry-After`. Copy signed off by Fraud
  and Legal (KEY-1088).

## Tests

63-ish specs, coverage around 41 percent lines. Distribution is deliberate rather than proud: the
OTP input is tested to death because it broke on paste in Safari twice (KEY-1602, KEY-1731); the
recovery flow has no tests at all because it was built in a fortnight for the 2022 card reissue and
nobody has been back. `docs/runbooks/coverage.md` explains the 38 percent gate and why it is not
higher.

## Known issues

- `feature/KEY-2210-mdc-migration` does not build. See above.
- `@meridian/canopy-ui` 3.6.1's README says to `@use '@meridian/canopy-ui/styles'`. That path does
  not exist in the 3.6.1 tarball (CNPY-2203, fixed in 3.7). We `@use` `tokens/css-vars` directly,
  which needs `node_modules` in `stylePreprocessorOptions.includePaths`. Do not remove that.
- Push approval polls every 2 seconds for 90 seconds. The IdP team keep promising SSE (KEY-1920).
- `RecoveryService` and `DeviceTrustService` fall back to local behaviour on a 404 from the BFF so
  the app is usable without platform-services. This is a dev convenience and must never be reached
  in UAT or prod; the BFF returns 501 there, not 404, precisely so it is not.
- Canopy icon lookups log `Error retrieving icon cn:*` in Karma because the sprite is not served
  under test. Noise only. KEY-2266.
- The theme includes both Material cores, so the bundle carries two sets of ripple/overlay styles
  (about 60 KB of CSS). Known, accepted until KEY-2210 lands.
- `environment.prod.ts` says its values are fallbacks for `env.json`. The chart writes `env.json`;
  the bootstrap loader that reads it was reverted in KEY-2301 after INC0148821 and never
  reinstated, so today the compiled values are what runs. Per-environment builds are done with
  `--configuration uat|production` instead. Fix or delete the comment, one or the other.
