# Application security standard — Keystone identity front end

Owner: @meridian/identity-platform. Standard reference: GIS-STD-014 Application Security Requirements for Internet
Facing and Internal Digital Channels, revision 9, effective 1 February 2026.

## Reporting

Suspected vulnerabilities go to the Global Information Security intake queue
(`gis-appsec-intake@meridian.internal`) with the component name `keystone-web` and, if the finding came
from a scan, the Checkmarx or Xray report identifier. Do not raise a public issue and do not
attach exploit payloads to a Jira ticket.

## Requirements this component is assessed against

1. **Authentication and session.** All authenticated surfaces obtain tokens from Keystone using
   OpenID Connect authorization code with PKCE. Tokens are never written to `localStorage` or to a
   cookie without `HttpOnly`. Idle timeout warns at 8 minutes and terminates at 10.
2. **Step up.** Money movement above the configured threshold requires an MFA claim no older than
   ten minutes (`mfa_at`). Step up is enforced server side; the front end guard is a convenience,
   not a control.
3. **Transport.** TLS 1.2 minimum. Certificate validation is never disabled, in code or in build
   configuration.
4. **Output encoding.** Angular's default sanitisation must not be bypassed. Any use of
   `bypassSecurityTrust*` requires a documented GIS exception with an expiry date.
5. **Cross site request forgery.** State changing calls carry the `X-MERIDIAN-XSRF` header sourced
   from the `MERIDIAN-XSRF` cookie.
6. **Content Security Policy.** No `unsafe-inline` for scripts. Vendor origins are allow-listed
   individually and reviewed at each release train.
7. **Secrets.** No credentials in source, configuration, fixtures or pipeline definitions. Runtime
   secrets are rendered by the Vault agent into the container environment. Placeholders in this
   estate take the form `CHANGEME-<purpose>`.
8. **Dependencies.** Only the internal registry may be used, see DEPENDENCY_POLICY.md in
   platform-tooling. High severity advisories block the release train.
9. **Logging.** No PII, card numbers, full account numbers or tokens in logs. Account numbers are
   masked to the last four digits. Every log line carries `correlationId`.
10. **Accessibility as a control.** WCAG 2.1 AA is contractual for consumer surfaces. Accessibility
    defects on authentication or money movement paths are treated as production incidents.

## Scanning

Checkmarx (`checkmarx.yml`) and SonarQube (`sonar-project.properties`) run in the Jenkins pipeline
for every pull request. The quality gate fails the build on any high severity finding and on a
coverage drop of more than two points against the branch baseline.

## Keystone specific controls (identity-platform addendum, reviewed with GIS 2024-02)

The list above is the estate template. For this component specifically:

- **Passwords.** One component (`CredentialFormComponent`) accepts a password. It emits it once to
  `IdpClientService.submitCredentials`, which POSTs it as a form body to the IdP over TLS with
  `withCredentials`. The form control is reset on submit. No interceptor, log line, telemetry event,
  storage call or error message may include it. Grep for `password` before every release; the
  expected hit list is in `docs/runbooks/release-checklist.md`. GIS-1490.
- **Tokens.** The application never mints, signs, decodes or stores a token. `angular-oauth2-oidc`
  performs the code exchange and id token validation; `token-claims.ts` copies a fixed set of
  standard claims from `getIdentityClaims()` afterwards. No `atob` on a JWT anywhere. In-memory
  storage only (library default, not overridden).
- **Device trust.** SHA-256 of eight documented navigator/screen properties, sent to the BFF, which
  binds it to an HttpOnly cookie. Nothing device-related is persisted client side.
  `docs/fraud-device-trust-requirements.md`, PRV-0119.
- **Open redirect.** Calling-application return URLs are validated against `allowedReturnOrigins`
  before use, and the IdP's post-MFA redirect is only followed if it is our registered callback
  with a `code`. GIS-PT-2021-07 item 4.
- **CSP.** `index.html` and `nginx.conf` both carry `default-src 'self'; script-src 'self'; style-src 'self'`
  with no `unsafe-inline`. `npm run csp:check` fails the build otherwise. `inlineCritical` is off
  in `angular.json` because the CLI would otherwise inline a `<style>` block into `index.html`.
- **Rate limiting.** Enforced by the IdP; surfaced by `RateLimitInterceptor` + banner. The app does
  not implement its own counter and must not (it would be trivially bypassable and would confuse
  the Fraud dashboards).
- **Item 5 above (XSRF) does not apply**: this app makes no state-changing calls to a same-origin
  API; the IdP form posts are cross-origin with `withCredentials` and the IdP validates `txn`.
  Waiver GIS-WV-2022-031.
