# ADR 0001: Keystone gets its own front end

Date: 2021-02-09. Status: accepted. Author: g.mwangi. Reviewed: identity-platform, cswt-architecture.

## Context

Until 2021 every channel rendered its own login form and posted credentials to the IdP through
its own BFF. Four forms, four MFA implementations, three different lockout messages, and Fraud
could not apply a rule change in fewer than three release trains (FRD-0201). The 2020 IdP
replacement programme (Keystone) made the IdP an OIDC provider; the question was whether each
channel should integrate with it directly or whether the login UI should be centralised.

## Decision

One Angular application at `login.meridiantrust.example` owned by identity-platform. Channels
redirect to it with a standard authorization request and receive a code back. It talks to the IdP
mock/real IdP over its form endpoints for the interactive steps (credentials, MFA, recovery) and
to the retail BFF for device trust, which needs the customer profile.

Angular rather than a server-rendered page from the IdP itself because (a) the IdP vendor's theming
is a JAR of FreeMarker and nobody on the team writes Java, and (b) Canopy did not exist yet but the
brand team had already asked for the login page to match the retail app.

## Consequences

- One team owns the most visible page in the bank. This has been fine and also a P1 (INC0142270).
- The app has to be tiny and fast. Budgets in `angular.json` are enforced.
- Every channel's step-up and re-auth also comes here, so the calling application's return URL is
  data we validate rather than trust. See `StepUpService`.
- A mock IdP is needed for local development from day one. That became `keystone-idp-mock`.
