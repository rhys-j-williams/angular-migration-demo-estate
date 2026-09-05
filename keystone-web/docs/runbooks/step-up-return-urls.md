# Runbook: step-up return URL allow list

A calling application sends the customer to `/step-up?return=<url>&reason=<code>`. We validate
`return` in `StepUpService.isAllowedReturn` against the origin allow list before we put it in the
OIDC `state`. If the URL is rejected the customer sees `StepUpInterstitialComponent`'s error and
telemetry records `stepup.rejected_return`.

The allow list is `allowedReturnOrigins` in `step-up.service.ts`. Yes, hard coded, all
environments in one array; moving it into `environment*.ts` is KEY-2288 and has been for a while.
Adding an origin:

1. Ticket in KEY, linked to the calling application's ticket. GIS approve the origin (they check it
   is a Meridian-controlled host on the WAF). Usually two days.
2. Add to `allowedReturnOrigins`. Exact origin, scheme included, no path, no wildcard. Localhost
   ports are permitted over http, everything else must be https (the service enforces this).
3. Add a case to `step-up.service.spec.ts`. The spec that asserts an open redirect is rejected is
   GIS-1180's regression test; if you touch it, tag `@meridian/gis-appsec` on the review.

History: the original implementation (2021) accepted any `https:` URL. Pen test finding
GIS-PT-2021-07 item 4, fixed in KEY-0902. Do not go back to that.
