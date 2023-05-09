# Runbook: the coverage gate

The Karma coverage check in `karma.conf.js` fails the build under 38 percent statements or lines.
Actual is around 41. The estate standard is 60 (TOOL-0230). This is a documented exception,
KEY-1877, renewed annually at the identity-platform quality review, last renewed 2025-11.

Why it is low, honestly:

- Most of the app is redirects and IdP form posts. Component specs for `LoginPageComponent`,
  `PushApprovalComponent`, `StepUpInterstitialComponent` need a fake `OAuthService`, a fake
  router and a fake IdP, and the one time we had them (KEY-1230) they broke on every
  `angular-oauth2-oidc` patch release and were deleted in KEY-1611.
- The recovery flow (`features/recovery`) has no tests. It was built in KEY-1412 for the 2022 card
  reissue with a hard date. Nobody has been back. It is listed in the tech debt register.
- What *is* tested is the part that breaks: `OtpInputComponent` (paste, Safari autofill,
  backspace behaviour, `one-time-code` autocomplete), `CredentialFormComponent` (the GIS-1490
  findings), the rate limit interceptor and banner, the fingerprint canonicalisation, and the
  claims reader.

If the gate fails on your branch: you probably added a feature module without a spec.
`app.module.spec.ts` imports every feature module so untested files are counted; adding code with
no specs lowers the percentage. Write a spec. Do not lower the number. Do not add
`/* istanbul ignore */`; Sonar counts it separately and GIS look at that count.

Reports: `coverage/keystone-web/index.html` locally, `reports/junit/` for Jenkins, Sonar project
`meridian:keystone-web`.
