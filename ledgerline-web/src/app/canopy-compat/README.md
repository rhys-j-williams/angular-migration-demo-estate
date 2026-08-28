# canopy-compat

Local stand-ins for Canopy components that do not work on the Angular version this application
runs. Owned by treasury-digital, reviewed by #canopy-design-system when anything is added.

| Component | Replaces | Why | Remove when |
|---|---|---|---|
| `ldg-filter-chips` | `cn-filter-chips` (`@meridian/canopy-ui/data-display` 3.7.2) | Compiled against Material 14 `mat-chip-list`; symbol removed in Material 15 MDC chips | Canopy 4.x on Angular 16+ (CNPY-2140), tracked here as LDG-1187 |

Rules for this directory, agreed with Canopy in the 2024-02 design system sync:

- Same selector suffix, same inputs, same outputs, same CSS class names as the Canopy original.
  Consumers must be able to switch back by renaming the tag.
- No new features. If the Canopy component cannot do it, raise a CNPY ticket; do not do it here.
- Every entry has a row in the table above with a removal condition. No removal condition, no merge.
- `patches/` handles anything that can be fixed by editing the published package. This directory is
  for the cases where the Material API underneath actually changed.

When Canopy 4 lands: delete the directory, replace `ldg-filter-chips` with `cn-filter-chips` in the
dashboard, approvals and audit filters, import `CnFilterChipsModule`, run the Cypress a11y specs.
The chips are in both axe scans so a regression will show.

Removal checklist (LDG-1350, drafted against the Canopy 4.0.0-rc.2 API notes, not the release):

1. `npm view @meridian/canopy-ui@4 peerDependencies` shows `@angular/core` `>=16`.
2. `patches/@meridian+canopy-ui+3.7.2.patch` deleted, `legacy-peer-deps` dropped from `.npmrc`,
   `npm ci` clean with no `patch-package` output.
3. This directory deleted; grep for `ldg-filter-chips` returns nothing.
4. `npx jest` and `npx cypress run` green. Coverage will dip by the compat spec; that is expected.
