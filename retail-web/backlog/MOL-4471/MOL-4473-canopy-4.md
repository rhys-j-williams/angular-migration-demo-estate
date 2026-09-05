# MOL-4473 Canopy 4 adoption

Parent: MOL-4471. Blocked on: CNPY-2400 (Canopy 4.0 release). Joint with MBZ-2210.

Canopy 3.7.x overrides Material 14 internals. Material 15+ (MDC) renames them. Canopy 4 is the
design system team's rebuild against MDC. Not funded as of Q4 2024.

When it exists:
- Bump `@meridian/canopy-ui` to 4.x, exact.
- Every `cn-*` component in `src/app` re-checked against the Canopy 4 changelog; they promise no
  API changes to the public selectors but the `CONTRIBUTING.md` in canopy-ui says the public
  API is frozen at 3.x, so read that promise carefully.
- Visual regression on every route. The Percy licence lapsed; talk to platform-engineering.
- `styles/_canopy-overrides.scss` in this repo has our own overrides on top of theirs (the
  dashboard card shadows and the transfer wizard stepper). Expect those to break too.

business-web is on Canopy 3.5.0 and needs to land in the same train or the two sites look
different for a fortnight, which the brand team have said no to before (MOL-2260).
