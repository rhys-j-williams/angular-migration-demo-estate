# ADR 0014: Defer the Angular 15+ upgrade

Status: Accepted
Date: 2024-06-27
Deciders: D. Okafor (retail-digital lead), M. Calderón, W. Tanaka (architecture), C. Mbeki (GIS AppSec)
Tickets: MOL-3801 (spike), MOL-4471 (epic, deferred), GIS-2207

## Context

Meridian Online is on Angular 14.3.0 (ADR 0011, November 2022). Angular 14 left LTS in November
2023. GIS raised GIS-2207 in March 2024 as a medium finding: framework out of vendor support.
Angular 17 is current. Architecture asked for a plan to at least 15, ideally 17, in the 2024
roadmap.

Blake Arceneaux ran a two-week spike in Q1 2024 (`feature/MOL-3801-angular15-spike`,
`SPIKE_NOTES.md`). `ng update @angular/core@15 @angular/cli@15` applies cleanly. The application
does not compile afterwards, and the notes list why. The short version:

1. **Canopy.** Canopy 3.7.x is built against Material 14. Material 15 moved the standard
   components to MDC and renamed or removed the internal classes Canopy's overrides target
   (ADR 0005 predicted this). The Canopy team estimate a 4.0 at three to four months of work, and
   the design system team is two people since the Plano reorg. Business Online is still on
   Canopy 3.5.0 and would need to move at the same time or the theme forks.
2. **flex-layout.** `@angular/flex-layout` is end of life; the last release supports Angular 14
   and the Angular team's guidance is CSS. We have `fxLayout`/`fxFlex` in something over a
   hundred templates including responsive `fxLayout.lt-md` variants. Rewriting those is a
   template-by-template job with a visual regression on every page.
3. **Lantern SDK.** `@meridian/lantern-sdk` 2.4.1 is View Engine and we depend on `ngcc` at
   install. Angular 16 removes `ngcc`. The vendor's Ivy build (LNTN-140) has been promised
   since 2022 and Digital Analytics Enablement have not been able to get a date. Replacing
   Lantern is a separate procurement conversation.
4. **Tests.** Coverage is in the mid thirties and the thin places are transfers and bill pay,
   which is exactly where the untyped forms (ADR 0012) and the MFA step-up live. An upgrade
   that touches forms and the router without tests underneath is a compliance conversation we
   would rather have with tests.
5. **Everything else.** `relativeLinkResolution`, `CanLoad`, `HttpClientXsrfModule`, six
   `toPromise` calls, `zone.js/dist/zone`, the Webpack browser builder. Individually small.
   Together with the above they make "just go to 15" a quarter, not a sprint.

The 2024 roadmap also has the Ledgerline core banking migration consuming most of the team's
capacity for the second half, and the real-time payments work with payments-platform.

## Decision

Defer. Meridian Online stays on Angular 14.3.0 through 2024. Epic MOL-4471 is created with the
child stories needed to unblock the upgrade (Canopy 4, flex-layout removal, Lantern replacement,
test coverage in transfers and bill pay) and parked with a target of Q2 2025 for a decision on
whether to go to 15 or straight to whatever is current then.

GIS-2207 is accepted as a risk by the retail digital product owner with the following
compensating controls, agreed with AppSec:

- `npm audit` in the Jenkins pipeline stays at its current threshold; the two known advisories
  are pinned via `overrides` in `package.json` and tracked in GIS-2207 rather than here.
- The CSP and interceptor chain are re-reviewed by AppSec each release train rather than each
  quarter.
- Any Angular security advisory rated high or critical against 14.x triggers an emergency
  reassessment.

## Consequences

We are choosing a bigger upgrade later over a smaller one now. Everyone in the room understood
that. The alternative, a partial upgrade with Canopy pinned and flex-layout patched, was tried on
the spike and produced something that compiled with `--force` and rendered nothing.

Reference for whoever picks this up: the spike branch is intact, do not delete it. Read
`SPIKE_NOTES.md` first. The order of operations that came out of the discussion is Lantern first
(it is the only one with an external dependency), then Canopy 4 alongside `business-web`, then
flex-layout with visual regression, then the framework itself.
