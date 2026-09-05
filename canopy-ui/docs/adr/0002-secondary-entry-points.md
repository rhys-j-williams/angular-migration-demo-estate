# ADR-0002: One secondary entry point per component family

Status: Accepted, 2021-07-01.
Owners: Canopy design system (H. Eriksen).

## Context

Canopy 3.0 shipped a single entry point. Meridian Online's main bundle grew by 310 KB (minified,
pre gzip) between 2.9 and 3.0 and the retail team's Lighthouse budget went red on the login
handoff page. Analysis (CNPY-1091) showed Material's tree shaking working as designed but every
Canopy module being pulled in through the single `CanopyModule` re-export, including the date
range component and Moment on pages that have no dates.

## Decision

Split the library into secondary entry points, one per component family, following the layout
Angular Material itself uses:

```
@meridian/canopy-ui/core
@meridian/canopy-ui/icons
@meridian/canopy-ui/a11y
@meridian/canopy-ui/actions
@meridian/canopy-ui/forms
@meridian/canopy-ui/data-display
@meridian/canopy-ui/navigation
@meridian/canopy-ui/overlays
@meridian/canopy-ui/feedback
@meridian/canopy-ui/layout
@meridian/canopy-ui/content
```

Each has its own `package.json` (for ng-packagr), `public-api.ts` and API report. The root entry
point remains and re-exports every family, so 3.0 consumers do not break. Families are chosen by
what changes together: `forms` is large but its members share the form field styling, and
splitting it further would have meant cross entry point Sass imports, which ng-packagr 12 handled
badly.

`public-api.ts` is the contract. What it exports is public; what it does not is internal, however
tempting the file path.

## Consequences

- Meridian Online's login handoff bundle dropped 240 KB once they moved to family imports
  (MOL-2877).
- Cross family dependencies must go through the public entry point of the other family
  (`import { CnCurrencyFormatService } from '@meridian/canopy-ui/core'` inside `forms`), which
  the `tsconfig.lib.json` path mapping resolves during the library build. Relative imports across
  families are rejected in review.
- The API report tooling has to handle eleven reports rather than one. `scripts/api-report.js`
  does this; api-extractor did not (CNPY-1188).
- Consumers who import from the root entry point still get everything. We have not removed the
  root entry point because keystone-web and the Iris widget use it and it is not worth the
  argument.
