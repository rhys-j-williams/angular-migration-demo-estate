# MOL-4474 Remove @angular/flex-layout

Parent: MOL-4471.

`@angular/flex-layout` 14.0.0-beta.41 is the final release. Replace `fxLayout`, `fxFlex`,
`fxLayoutGap`, `fxLayoutAlign`, `fxHide`/`fxShow` and the responsive suffixes (`.lt-md`, `.gt-sm`
and friends) with CSS. Count in the spike notes was 113 occurrences over 47 templates; recount
before estimating, it has grown.

Approach agreed with the design system team: utility classes from Canopy (`cn-row`, `cn-col`,
`cn-gap-*`) where they exist, CSS grid in component SCSS where they do not. No new third-party
layout library.

Order: shared components first (they are in everything), then dashboard, then the feature
modules by traffic: accounts, transfers, cards, bill pay, then the rest. One PR per feature so
the visual regression is reviewable.

The responsive ones are the risk. `fxLayout.lt-md="column"` on the dashboard and the transfer
wizard are what makes the site usable on a phone, and mobile is 61% of sessions. Test on real
devices, not just the Chrome emulator; the spike notes mention the breakpoints misbehaving under
CDK 15 and we never worked out why.

## Progress

- 2026-08-26: help/faq converted as the pattern template. 46 to go. Visual regression baseline still
  to be captured before touching anything with `fxLayout.lt-md`.
