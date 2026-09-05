# Changelog

Release trains, most recent first. Ticket keys link to Jira. Only customer visible or operationally
relevant changes are listed; dependency bumps are in the git log.

## 2024.11.1

- KEY-2266 quieten Canopy icon errors in Karma (not fixed, documented)
- KEY-2259 push approval: show number matching digits larger, contact centre feedback
- KEY-2251 rate limit banner copy for the recovery scope

## 2024.09.2

- KEY-2237 maintenance notice component, driven by `maintenanceWindow` in environment
- KEY-2230 remove `bypassSecurityTrustHtml` from the locked-out screen (GIS-1902)

## 2024.06.1

- KEY-2210 partial: OTP input, device trust, recovery, session screens to MDC. Login and MFA
  screens remain on legacy Material. See docs/adr/0003.
- KEY-2214 device trust page shows the trust duration from environment instead of "30 days"

## 2024.03.1

- KEY-2172 Angular 15.2.10, Material 15.2.9 (legacy entry points), TypeScript 4.9.5,
  angular-oauth2-oidc 15.0.1. Eleven weeks. Never again.
- KEY-2180 "trust this device?" inline prompt on the OTP screen
- KEY-2188 standalone components permitted (CONTRIBUTING updated)

## 2023.11.2

- KEY-2077 coverage now counts every source file, not just the ones with specs. Number dropped from
  89 to 41. Gate set at 38 (KEY-1877 exception).
- KEY-2051 Canopy 3.6.1, tokens emitted as CSS variables

## 2023.09.1

- FRD-0561 outcome: no changes to fingerprint inputs. Documented in docs/fraud-device-trust-requirements.md.
- KEY-1993 pod security context hardening (partial, root fs still writable)

## 2023.03.2

- INC0142270 hotfix: OAuth discovery failure no longer renders a blank page; falls back to the
  static error screen with a correlation id.

## 2022.11.1

- GIS-1490 findings 1 and 2: password control reset after submit; username removed from
  telemetry. KEY-1493, KEY-1494.
- KEY-1560 / KEY-1571 device trust enrolment (fingerprint + BFF cookie)

## 2022.10.1

- KEY-1412 account recovery flow (email + last four of card). Shipped for the card reissue. No
  tests, see runbook.

## 2022.03.1

- KEY-1355 CoreModule import guard after the double-OAuthService afternoon

- KEY-1088 rate limit banner, Fraud/Legal copy
- KEY-1230 login page and push specs (later deleted, KEY-1611)

## 2021.10.2

- KEY-0902 step-up return URL allow list (GIS-PT-2021-07 item 4)
- KEY-0871 authenticator app (TOTP) as an MFA channel

## 2021.06.1

- KEY-0611 push approval with number matching
- KEY-0471 brand sign-off on the credential form. Do not move pixels.

## 2021.03.1

- KEY-0301 first release: username/password + SMS OTP, authorization code with PKCE
