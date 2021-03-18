# ADR 0005: Angular Material through Canopy

Status: Accepted
Date: 2021-03-18
Deciders: S. Whitfield (retail-digital), H. Eriksen (canopy-design-system), W. Tanaka (architecture)
Ticket: MOL-1188, CNPY-210

## Context

Meridian Online launched on a mix of hand-rolled components and a copy of the old MeridianStyle
bootstrap theme from the 2016 site. Business Online (`business-web`) has its own copy of the same
theme with different fixes. The Digital Design Council set up the Canopy design system team in
January to stop this, and their first decision (CNPY-102) was to build Canopy as a thin layer over
Angular Material rather than from scratch.

We have to pick how Meridian Online consumes it. Options that were on the table:

1. Use Angular Material directly, with a Meridian theme in `styles/`. Fast, no dependency on the
   Canopy team's schedule, but the two applications drift again within a year.
2. Use `@meridian/canopy-ui` exclusively and never import `@angular/material` in application code.
   Everything the application needs either exists in Canopy or is a Canopy ticket.
3. Both: Canopy for what it has, Material for what it does not.

## Decision

Option 2. Application code imports from `@meridian/canopy-ui` only. `@angular/material` and
`@angular/cdk` stay in `package.json` because Canopy declares them as peers. An ESLint
`no-restricted-imports` rule blocking `@angular/material/*` in `src/app` is part of this decision
and is tracked as MOL-1190. Canopy re-exports the
Material modules it wraps (`CnFormsModule`, `CnLayoutModule`, `CnFeedbackModule`, `CnDataModule`)
and applies the Meridian theme internally through its own `mat-*` overrides in
`_material-overrides.scss`.

Where Canopy does not have something, we raise a `CNPY` ticket and either wait or build a
temporary component in `shared/` with a `// TODO CNPY-nnnn` and a removal date. The design system
team commit to a two-sprint turnaround on requests from Tier 1 applications.

## Consequences

Good: one theme, one accessibility audit, one place to fix the focus ring. The mixed-theme bugs
in the 2020 release notes (MOL-720, MOL-812, MOL-901) go away as a class.

Bad, and we are writing this down so nobody is surprised later:

- Canopy's Material overrides reach into Material's internal class names (`.mat-form-field-flex`,
  `.mat-select-arrow-wrapper` and so on). Every Material major that changes those internals is a
  Canopy major before it is a Meridian Online upgrade. The Canopy team accept this and own it.
- We are coupled to the Canopy release cadence for Angular majors. Meridian Online cannot move
  to Angular N+1 until Canopy has a release built against it.
- Bundle size goes up slightly because Canopy pulls modules we do not use. Measured at 38 KB
  gzipped on the initial chunk; accepted.

## Notes

MOL-1190 (the lint rule) was never done. `shared.module.ts` re-exports `MatFormFieldModule`,
`MatInputModule` and `MatIconModule` directly because Canopy 3.x does not wrap plain inputs, and
`MatDialogRef`/`MAT_DIALOG_DATA` are injected directly because Canopy does not wrap the dialog
tokens (CNPY-388, open). So option 2 is what we say and option 3 is what we do, in about six
places. Noted here in 2023 rather than pretending otherwise.

2022-11 addendum (MOL-2950): during the Angular 14 upgrade Canopy 3.5 lagged Material 14 by about
five weeks. It was fine, but it is the first data point for the second "bad" bullet above.
