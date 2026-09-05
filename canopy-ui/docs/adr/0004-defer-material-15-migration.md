# ADR-0004: Defer the Angular 15 / Material MDC migration to a Canopy 4.0.0

Status: Accepted, 2024-05-23. Architecture forum minute AF-2024-11. Review date: 2025-03.
Owners: Canopy design system (L. Fontaine, S. Whitfield), CSWT architecture (W. Tanaka).
Related: ADR-0001, MOL-4471 (Meridian Online upgrade epic), CNPY-1900 (Angular 15 spike).

## Context

Angular 14 left long term support in November 2023. Every Canopy consumer is on 14 and cannot
move until Canopy does, because Canopy's peer range is `14.x`.

The CNPY-1900 spike (March 2024, two engineers, three weeks) attempted an in place upgrade to
Angular 15.2 and Material 15.2 on a branch. Findings, in order of cost:

1. Material 15 replaces the component implementations with MDC based ones. The pre MDC
   components remain available as `MatLegacy*` modules for one release only. Canopy's stylesheets
   target the pre MDC class names in at least fourteen components (`.mat-button-wrapper`,
   `.mat-form-field-underline`, `.mat-select-panel`, `.mat-slide-toggle-bar`, `.mat-header-cell`,
   `.mat-tab-label`, `.mat-ink-bar`, `.mat-dialog-container`, `.mat-simple-snackbar`,
   `.mat-tooltip`, `.mat-progress-bar-fill`, `.mat-slider-thumb`, chips, and the radio and
   checkbox ripples). Every one of those rules is dead against the MDC components, and the visual
   result does not match Figma.
2. `mat.define-typography-config` renames its levels in 15 (`$headline-1` to `$headline-6`,
   `$body-1`, `$subtitle-1`, and so on). Our config, and every consumer that includes the theme
   mixin with an override, fails to compile.
3. `MatFormFieldControl` changes for the currency input are manageable, but the prefix alignment
   against the underline is gone because there is no underline.
4. `MatChipList` becomes `MatChipListbox` / `MatChipGrid` with different selection semantics.
   `cn-filter-chips` needs a rewrite, not a rename.
5. The slider loses `thumbLabel`, `displayWith` and `tickInterval`. `cn-amount-slider` needs a
   redesign with the design team, not just an engineering change.
6. `@angular/flex-layout` is end of life at 15. `cn-page-header` and `cn-page-shell` use it, as
   do a large number of consumer templates.
7. Meridian Business is still on Canopy 3.5.0 and RxJS 6 (MBZ-2210). Any Canopy release that
   requires Angular 15 leaves them behind regardless.

The spike branch built, with the legacy modules, after ten days. It did not pass visual review.
It was not merged.

## Decision

The Material 15 migration is a Canopy major, 4.0.0, not a 3.x minor. Specifically:

- Canopy 3.x stays on Angular 14 and Material 14. 3.x receives fixes and additive features only.
- Canopy 4.0.0 targets Angular 15 or later (the forum leaned towards skipping straight to 16 if
  the timeline allows), MDC components, the new typography level names, and no
  `@angular/flex-layout`. Internal Material class overrides are to be replaced with the theming
  and density APIs, or with Canopy owned DOM where Material exposes nothing.
- 4.0.0 ships with a migration guide and a consumer facing schematic for the theme mixin changes.
- The public API of 3.x remains frozen. Consumers must not start reaching into internals to work
  around 3.x limitations ahead of 4.0, because that work is exactly what 4.0 will break (see
  CONTRIBUTING.md, and the Ledgerline patch situation in LDG-3104).
- Funding for 4.0.0 goes through the 2025 portfolio process. Until then the upgrade is deferred.

## Consequences

- The bank stays on an out of support Angular for at least another two trains. GIS accepted the
  risk (GIS-RA-2024-052) on the basis that Angular 14 receives no known unpatched CVE at the
  time and that the consumers sit behind the WAF.
- Consumers' upgrade epics (MOL-4471, MBZ-2210, LDG-2990, KEY-1444) are blocked on Canopy 4.0.0
  and should say so in their status.
- The spike branch `spike/CNPY-1900-angular-15` is kept for reference and should not be rebased.
- The showcase remains the acceptance surface for 4.0: every 3.x component page must render
  identically on 4.0 before it ships.
