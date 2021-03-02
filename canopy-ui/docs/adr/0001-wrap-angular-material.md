# ADR-0001: Build Canopy 3 on Angular Material rather than continuing the Bootstrap 2.x library

Status: Accepted, 2021-02-11. Architecture forum minute AF-2021-04.
Owners: Canopy design system (L. Fontaine), CSWT architecture (W. Tanaka).
Supersedes: none. Superseded by: none.

## Context

Canopy 2.x is a Bootstrap 4 based Angular component set that grew out of the 2018 Meridian Online
redesign. By late 2020 it had three problems that kept coming up in the digital portfolio review:

1. Accessibility. The DAS-2.1 audit (October 2020) raised 41 findings against Meridian Online, 29
   of them in Canopy 2 components: focus management in modals, missing live regions, keyboard
   handling in the custom select. Each fix was bespoke.
2. Duplication. Meridian Business had forked four components (chips, table, date picker, dialog)
   because Canopy 2 did not have what they needed, and those forks had drifted.
3. Angular 11 and the Ivy renderer. Canopy 2 still shipped a View Engine build with `ngcc`
   warnings on every consumer install.

Options on the table were: (a) continue Canopy 2 and fix the findings component by component;
(b) rebuild on Angular Material and the CDK; (c) rebuild on a commercial suite (two vendors were
evaluated under NDA, both rejected on licensing terms by procurement).

## Decision

Rebuild as Canopy 3 on Angular Material 11 and the CDK, with the Sass module system
(`@use '@angular/material' as mat`). Material provides the accessibility primitives (focus trap,
live announcer, overlay, a11y key manager) and the component harnesses for testing. Canopy owns:

- the tokens and theme, expressed through Material's theming API (`mat.define-palette`,
  `mat.define-typography-config`, `mat.all-component-themes`) so every Material component picks
  up the brand without per component work;
- the bank specific components Material does not have (account card, currency input, masked
  input, filter chips with our semantics, page shell);
- the visual adjustments the design team requires where Material's defaults do not match the
  Figma library. These are done in component stylesheets against Material's class names, scoped
  by a Canopy class on the host.

The `cn` prefix is used throughout. 2.x is frozen at 2.9.4 and receives security fixes only until
Meridian Business has migrated (target: 2021.09 train, actual: 2022.03).

## Consequences

- Consumers get Material's accessibility behaviour for free, and the DAS findings closed in the
  3.0 release rather than over four quarters.
- Canopy is coupled to Material's internal DOM and class names wherever the design team's
  adjustments go beyond what the theming API exposes. The forum accepted this on the basis that
  Material's class names have been stable across 8 through 11 and that a Material major would be
  treated as a Canopy major. (2024 note: this is exactly what the MDC based components in
  Material 15 do to us. See ADR-0004.)
- Bundle size went up by roughly 180 KB gzipped for Meridian Online. Accepted.
- The Business team's forks are deleted as each Canopy 3 equivalent lands. Tracked under
  MBZ-1140.
- Material's Moment date adapter is used for the date range rather than the native adapter
  because every consumer already ships Moment for statement formatting. Revisit if Moment is ever
  removed from the consumers.
