# Application security notes — Iris assistant widget

Owner: @meridian/retail-digital. Reviewer: @meridian/gis-appsec. Standard reference: GIS-STD-014
Application Security Requirements for Internet Facing and Internal Digital Channels, revision 9,
effective 1 February 2026. Tier 2 (no money movement, no credential entry).

## Reporting

Suspected vulnerabilities go to the Global Information Security intake queue
(`gis-appsec-intake@meridian.internal`) with the component name `iris-widget` and, if the finding came
from a scan, the Checkmarx or Xray report identifier. Do not raise a public issue and do not
attach exploit payloads to a Jira ticket.

## What this component does and does not do

It is a chat UI loaded into another application's page. It has no login, no routes, no storage.
The threat model (GIS-TM-2022-088, reviewed 2024-01) is essentially: it runs in the host's origin
with the host's DOM, so anything it does wrong, the host wears.

1. **Tokens.** The customer's Keystone access token is handed to the widget by the host through the
   `bearer-token` attribute and held in memory in the widget's injector. The widget never reads
   `localStorage`, `sessionStorage`, cookies or the URL for a token (GIS-1522). It never logs the
   token; `HttpErrorResponse` objects logged on failure have the request headers stripped by
   Angular already, and the tests check that a 401 produces a system message and not a console
   dump of the request.
2. **Output encoding.** Everything from the orchestrator is rendered through interpolation, never
   `innerHTML`. No `bypassSecurityTrust*` anywhere; Checkmarx has a rule for it and the build fails.
   The orchestrator says its replies are plain text; we do not trust that, we just do not need to.
3. **Transcript export.** Client-side Blob of what is on screen. No server round trip, no PII beyond
   what the customer already saw. Failed (unsent) messages are excluded. Legal-approved footer.
4. **CSP.** The widget adds no inline scripts or styles at runtime (Angular's emulated
   encapsulation injects `<style>` elements, which retail-web's CSP allows with a nonce it applies
   to all Angular-injected styles; see their `csp.conf`). If a host has `style-src 'self'` only,
   the widget renders unstyled. Known, documented in the embedding runbook, not fixable by us.
5. **Cross-origin.** By default the orchestrator is same-origin via the host's ingress. Where
   `orchestrator-url` is set to another origin the orchestrator's CORS allowlist governs; the widget
   sends no credentials cookie, only the bearer header.
6. **Dependencies.** Internal registry only, `.npmrc` in this directory. Exact versions. Xray runs
   in the pipeline; `Jenkinsfile` carries the allowlisted advisories with their GIS-RA references.
7. **Logging.** Console only, prefixed `[iris-widget]`, no message content. The correlation id on
   every request is what support uses to join our side to the orchestrator's.
8. **Secrets.** None. The dev shell carries an unsigned JWT whose payload is `{"sub":"cust-0001"}`;
   it is not a secret and it is deleted from the build output by `postbuild.js`.

## Scanning

Checkmarx (`checkmarx.yml`) and SonarQube (`sonar-project.properties`) run in the Jenkins pipeline
for every pull request. Tier 2 thresholds: high blocks, medium is reported.
