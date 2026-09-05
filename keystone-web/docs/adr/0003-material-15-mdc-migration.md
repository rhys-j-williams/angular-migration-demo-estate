# ADR 0003: Angular 15 upgrade keeps legacy Material, MDC migration is a separate ticket

Date: 2024-01-18. Status: accepted, and then not really followed through. Author: o.lindqvist.

## Context

KEY-2172 moves the app from Angular 14.2 to 15.2. Material 15 replaces every component with an
MDC implementation and moves the old ones to `@angular/material/legacy-*` with `MatLegacy*` names.
The `ng update` schematic rewrites all imports to the legacy entry points so the app keeps working
pixel for pixel.

The alternative was to migrate to MDC as part of the upgrade. Estimated at three to four weeks on
top because MDC changes form field density and heights, and the credential form has a brand
sign-off attached to its exact rendering (KEY-0471). Brand review lead time is six weeks.

## Decision

Take the upgrade with the legacy entry points. Open KEY-2210 to migrate to MDC "in Q1". Migrate
opportunistically: anything new goes straight to MDC and standalone, and anything touched for
another reason gets moved while it is open.

Both Material theme mixins are included from `_theme.scss` so the legacy and MDC components are
both themed. The MDC ones use the same palette so the mismatch is mostly density.

## Consequences (written 2024-09, o.lindqvist, before leaving for payments-platform)

- KEY-2210 got about half way. The stuff nobody screenshots moved. The login page did not.
- `feature/KEY-2210-mdc-migration` is the state of the attempt. It does not compile; the
  `MatLegacyFormFieldModule` was removed from `SharedLegacyModule` but `CredentialFormComponent`
  still uses `mat-form-field` from it and `MatFormFieldModule` (MDC) does not accept the legacy
  `appearance="legacy"` or the `matSuffix` on a legacy input. Left as is so whoever picks it up
  can see where it stopped.
- Angular 16 is technically possible with legacy modules (they exist until 17) but our lint config
  fails on the deprecation annotations. Angular 17 deletes them. So this app is on 15 until KEY-2210
  is done, and every other application in the estate that wants to go past 16 for its own reasons
  is going to be redirecting to a 15 app for its login. That has been raised (ARCH-0912) and
  acknowledged.
- The bundle carries both `mat.core()` and `mat.legacy-core()`. About 60 KB CSS. Accepted.
