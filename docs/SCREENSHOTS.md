# Rendered surfaces

Reference captures of the six Angular front ends, taken against a local stack
(`mock-external/estate-up.sh` plus each directory's `npm start`) at 1440x900. Data is fixture output
from `@northgate/domain-fixtures`; users are the Keystone IDP mock fixtures (`/debug/users` on
port 4400). No capture in this directory comes from a production or UAT environment. Refresh these
when a surface changes materially; MOL-2210 asks for a gallery refresh per release train.

| Surface | Directory | Port | Framework |
|---|---|---|---|
| [Northgate Online](#northgate-online-retail-web) | [northgate-retail-web](https://github.com/rhys-j-williams/northgate-retail-web) | 4200 | Angular 14.3.0 |
| [Northgate Business](#northgate-business-business-web) | [northgate-business-web](https://github.com/rhys-j-williams/northgate-business-web) | 4201 | Angular 14.2.12 |
| [Keystone](#keystone-keystone-web) | [northgate-keystone-web](https://github.com/rhys-j-williams/northgate-keystone-web) | 4202 | Angular 15.2.10 |
| [Ledgerline](#ledgerline-ledgerline-web) | [northgate-ledgerline-web](https://github.com/rhys-j-williams/northgate-ledgerline-web) | 4203 | Angular 16.2.12 |
| [Canopy showcase](#canopy-showcase-northgate-canopy-ui) | [northgate-canopy-ui](https://github.com/rhys-j-williams/northgate-canopy-ui) | 4204 | Angular 14.3.0 |
| [Iris widget](#iris-widget-iris-widget) | [northgate-iris-widget](https://github.com/rhys-j-williams/northgate-iris-widget) | 4205 | Angular 14.3.0 |

## Northgate Online ([northgate-retail-web](https://github.com/rhys-j-williams/northgate-retail-web))

Consumer banking. The app is behind Keystone: an unauthenticated visit is bounced to the IDP mock
on port 4400 (first capture), then back to `/dashboard` after password and MFA.

Note the dashboard and Transfers views show empty states and one "could not find" banner: the
retail BFF on port 4500 only serves `/api/v1/accounts` today and the account payload does not carry
the `accountNumber`/`availableBalanceMinor` fields the Angular models expect (MOL-2302, open).
Accounts still lists the two fixture accounts.

| | |
|---|---|
| Keystone sign in (redirect from 4200) | Dashboard |
| ![Sign in](screenshots/retail-web--sign-in.png) | ![Dashboard](screenshots/retail-web--dashboard.png) |
| Accounts | Transfers |
| ![Accounts](screenshots/retail-web--accounts.png) | ![Transfers](screenshots/retail-web--transfers.png) |
| Cards | |
| ![Cards](screenshots/retail-web--cards.png) | |

## Northgate Business ([northgate-business-web](https://github.com/rhys-j-williams/northgate-business-web))

Small business banking, RxJS 6, TSLint, Node 14. Signed in as the Pinnacle Ridge Surveying administrator
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

## Keystone ([northgate-keystone-web](https://github.com/rhys-j-williams/northgate-keystone-web))

Login, MFA, device trust and recovery. Keystone ships a `Content-Security-Policy` meta with
`style-src 'self'` and no `unsafe-inline` (KEY-1733, GIS-1802). Under `ng serve` Angular 15 still
injects component styles as inline `<style>` tags, so a plain dev-server visit renders unstyled;
these captures were taken with the CSP meta tag and response header removed at the proxy for the capture run only.
Production builds are unaffected; the dev-server behaviour is tracked as KEY-1790.

| | |
|---|---|
| Sign in | Sign in after `login_required` |
| ![Sign in](screenshots/keystone-web--home.png) | ![Login required](screenshots/keystone-web--login-required.png) |
| Username recovery | Session timed out |
| ![Recovery](screenshots/keystone-web--recovery.png) | ![Expired](screenshots/keystone-web--expired.png) |
| Unrecognised step-up link | |
| ![Invalid link](screenshots/keystone-web--invalid-link.png) | |

## Ledgerline ([northgate-ledgerline-web](https://github.com/rhys-j-williams/northgate-ledgerline-web))

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

## Canopy showcase (northgate-canopy-ui)

The design system's showcase application (`ng serve canopy-showcase`), which is what consumer
teams are pointed at when they raise a CNPY ticket.

| | |
|---|---|
| Sample consumer dashboard | Design tokens |
| ![Dashboard](screenshots/canopy-showcase--dashboard.png) | ![Tokens](screenshots/canopy-showcase--tokens.png) |
| Themes | Icon sprite |
| ![Themes](screenshots/canopy-showcase--themes.png) | ![Icons](screenshots/canopy-showcase--icons.png) |

## Iris widget ([northgate-iris-widget](https://github.com/rhys-j-williams/northgate-iris-widget))

Angular Elements custom element, served from a development build over a static server (the dev
shell in `src/index.html` stands in for a host page). Unauthenticated, so the panel shows the
sign-in notice rather than a conversation.

| | |
|---|---|
| Host page with launcher | Panel open |
| ![Dev shell](screenshots/iris-widget--dev-shell.png) | ![Panel](screenshots/iris-widget--panel-open.png) |
