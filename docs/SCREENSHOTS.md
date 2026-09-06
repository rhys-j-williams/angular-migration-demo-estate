# Rendered surfaces

Reference captures of the six Angular front ends, taken against the local estate
(`mock-external/estate-up.sh` plus each directory's `npm start`) at 1440x900. Data is fixture output
from `@meridian/domain-fixtures`; users are the Keystone IDP mock fixtures (`/debug/users` on
port 4400). Nothing here is a production screen. Refresh these when a surface changes materially
(MOL-2210 asks for a gallery refresh per release train); the capture routine is in the
"Screenshot gallery" entry of [BUILD_LOG.md](../BUILD_LOG.md).

| Surface | Directory | Port | Framework |
|---|---|---|---|
| [Meridian Online](#meridian-online-retail-web) | `retail-web/` | 4200 | Angular 14.3.0 |
| [Meridian Business](#meridian-business-business-web) | `business-web/` | 4201 | Angular 14.2.12 |
| [Keystone](#keystone-keystone-web) | `keystone-web/` | 4202 | Angular 15.2.10 |
| [Ledgerline](#ledgerline-ledgerline-web) | `ledgerline-web/` | 4203 | Angular 16.2.12 |
| [Canopy showcase](#canopy-showcase-canopy-ui) | `canopy-ui/` | 4204 | Angular 14.3.0 |
| [Iris widget](#iris-widget-iris-widget) | `iris-widget/` | 4205 | Angular 14.3.0 |

## Meridian Online (`retail-web/`)

Consumer banking. The app is behind Keystone: an unauthenticated visit is bounced to the IDP mock
on port 4400 (first capture), then back to `/dashboard` after password and MFA.

Note the dashboard and Transfers views show empty states and one "could not find" banner: the
retail BFF on port 4500 only serves `/api/v1/accounts` today and the account payload does not carry
the `accountNumber`/`availableBalanceMinor` fields the Angular models expect (MOL-2302, see
BUILD_LOG). Accounts still lists the two fixture accounts.

| | |
|---|---|
| Keystone sign in (redirect from 4200) | Dashboard |
| ![Sign in](screenshots/retail-web--sign-in.png) | ![Dashboard](screenshots/retail-web--dashboard.png) |
| Accounts | Transfers |
| ![Accounts](screenshots/retail-web--accounts.png) | ![Transfers](screenshots/retail-web--transfers.png) |
| Cards | |
| ![Cards](screenshots/retail-web--cards.png) | |

## Meridian Business (`business-web/`)

Small business banking, RxJS 6, TSLint, Node 14. Signed in as the Redwing Electrical administrator
fixture. Wires, approvals and payroll come from the business BFF on port 4501.

| | |
|---|---|
| Accounts | ACH origination |
| ![Accounts](screenshots/business-web--accounts.png) | ![ACH](screenshots/business-web--ach.png) |
| Wires | Approvals |
| ![Wires](screenshots/business-web--wires.png) | ![Approvals](screenshots/business-web--approvals.png) |
| Payroll | Reports |
| ![Payroll](screenshots/business-web--payroll.png) | ![Reports](screenshots/business-web--reports.png) |
| Users | |
| ![Users](screenshots/business-web--users.png) | |

## Keystone (`keystone-web/`)

Login, MFA, device trust and recovery. Keystone ships a `Content-Security-Policy` meta with
`style-src 'self'` and no `unsafe-inline` (KEY-1733, GIS-1802). Under `ng serve` Angular 15 still
injects component styles as inline `<style>` tags, so a plain dev-server visit renders unstyled;
these captures were taken with the CSP meta stripped by the capture harness. The repository is
unchanged - the discrepancy between the README's claim and dev-server behaviour is a finding for
the migration review, not something to patch here.

| | |
|---|---|
| Sign in | Sign in after `login_required` |
| ![Sign in](screenshots/keystone-web--home.png) | ![Login required](screenshots/keystone-web--login-required.png) |
| Username recovery | Session timed out |
| ![Recovery](screenshots/keystone-web--recovery.png) | ![Expired](screenshots/keystone-web--expired.png) |
| Unrecognised step-up link | |
| ![Invalid link](screenshots/keystone-web--invalid-link.png) | |

## Ledgerline (`ledgerline-web/`)

Corporate treasury, standalone components, Angular 16 with `patch-package`. Signed in as the
treasury approver fixture; exposure, positive pay and audit data from the treasury services
(ports 4512-4520).

| | |
|---|---|
| Liquidity dashboard | Payment approvals |
| ![Dashboard](screenshots/ledgerline-web--dashboard.png) | ![Approvals](screenshots/ledgerline-web--approvals.png) |
| Positive pay exceptions | Audit |
| ![Positive pay](screenshots/ledgerline-web--positive-pay.png) | ![Audit](screenshots/ledgerline-web--audit.png) |
| User entitlements | |
| ![Entitlements](screenshots/ledgerline-web--entitlements.png) | |

## Canopy showcase (`canopy-ui/`)

The design system's own demo app (`ng serve canopy-showcase`), which is what consumer teams are
pointed at when they raise a CNPY ticket.

| | |
|---|---|
| Banking demo (sample consumer) | Design tokens |
| ![Dashboard](screenshots/canopy-showcase--dashboard.png) | ![Tokens](screenshots/canopy-showcase--tokens.png) |
| Themes | Icon sprite |
| ![Themes](screenshots/canopy-showcase--themes.png) | ![Icons](screenshots/canopy-showcase--icons.png) |

## Iris widget (`iris-widget/`)

Angular Elements custom element, served from a development build over a static server (the dev
shell in `src/index.html` is the fake host page). Unauthenticated, so the panel shows the
sign-in notice rather than a conversation.

| | |
|---|---|
| Host page with launcher | Panel open |
| ![Dev shell](screenshots/iris-widget--dev-shell.png) | ![Panel](screenshots/iris-widget--panel-open.png) |
