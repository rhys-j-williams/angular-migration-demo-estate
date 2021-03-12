# ADR 0002: Authorization code with PKCE, angular-oauth2-oidc, no silent refresh

Date: 2021-03-22, revised 2022-11-04 (GIS-1490). Status: accepted.

## Context

Keystone (the IdP) supports implicit and authorization code. The 2021 draft used implicit because
that is what the sample did. GIS rejected it at the design review: tokens in the fragment, no
refresh story, and OAuth 2.1 was already deprecating it.

Options for the client library were `angular-oauth2-oidc` (manfredsteyer), `oidc-client-js`, or
hand-rolling. Hand-rolling was ruled out by GIS-STD-014 section 4 ("do not implement token
handling yourself"). `oidc-client-js` was going into maintenance mode at the time.

## Decision

`angular-oauth2-oidc`, authorization code with PKCE (S256), public client `keystone-web`, no
client secret anywhere. Discovery document loaded at `APP_INITIALIZER`. `strictDiscoveryDocumentValidation`
is on outside local because the mock's issuer is `http://localhost:4400` and its document says so.

No silent refresh and no refresh tokens. This application's session is measured in minutes; it
hands off to the calling application on success. The calling application manages its own session.
This is also why there is no token storage configuration: the library's default in-memory storage
is correct for us. `OAuthStorage` is not overridden. If you find yourself wanting `localStorage`
here, you are building the wrong thing in the wrong repository.

Claims: after the library has validated the id token we read `sub`, `preferred_username`, `amr`,
`acr`, `auth_time`, `mfa_at` and `device_trusted` (`token-claims.ts`). We do not decode JWTs
ourselves; the library exposes `getIdentityClaims()` post-validation and that is the only path.

## Consequences

- The pinned version is 15.0.1 because it is the last one that declares an Angular 15 peer. It is
  fine. It will need to move with Angular and its major tracks Angular's.
- The mock IdP needs a real PKCE implementation. It has one.
- Step-up uses `acr_values=loa2` and `prompt=login` on a second authorization request, with the
  calling application's return URL in `state` (encoded, validated against the allow list). See
  `StepUpService` and `docs/runbooks/step-up-return-urls.md`.
- 2022-11 revision: GIS-1490 finding 1 was that the credential FormGroup retained the password
  after submit. Fixed in KEY-1493 by resetting the control. Finding 2 (telemetry payload included
  the username) fixed in KEY-1494. Both are now spec'd.
