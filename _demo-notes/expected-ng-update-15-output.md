# Expected output of `ng update` to Angular 15 — canopy-ui

Captured 2026-09-05 by the Canopy build session, for the presenter's reference and for judging
whether Devin's own dry run on stage matches what the tooling really says.

## How it was produced

Directory: `canopy-ui/` at `develop` head after the CNPY-2140 merge (package version 3.7.2,
Angular 14.3.0, Material 14.2.7, CLI 14.2.13, Node 16.20.2, npm 8.19.4). Verdaccio on 4873 had
`@meridian/domain-fixtures@1.6.0` and the three `@meridian/canopy-ui` versions seeded; the first
attempt without domain-fixtures present failed with
`Migration failed: 404 Not Found - GET http://localhost:4873/@meridian%2fdomain-fixtures`, so seed
the registry first.

Angular CLI 14 does **not** have `ng update --dry-run` (`Error: Unknown argument: dry-run`; see
`ng update --help`, the options are `--force --next --migrate-only --name --from --to --allow-dirty
--verbose --create-commits`). To get the equivalent without touching the tree, the commands were
run in a throwaway `git worktree` of the same commit with a hard-linked copy of `node_modules`, the
output captured, and the worktree deleted afterwards. Nothing under `canopy-ui/` on `develop` was
modified; `git status` is clean.

Three commands, in this order, output verbatim below (spinner control characters stripped):

1. `npx ng update` (no packages) — the "what is available" table.
2. `npx ng update @angular/core@15 @angular/cli@15` — fails on a peer dependency; rerun with
   `--force`, which is what any team would do and what the brief expects on stage.
3. `npx ng update @angular/material@15 --force --allow-dirty` — the MDC migration.

`@angular/cli@15` resolves to 15.2.11 and `@angular/core@15` to 15.2.10 today; `@angular/material@15`
to 15.2.9. If the registry moves those numbers will differ; nothing else in the output should.

## 1. `npx ng update`

```text
Using package manager: npm
Collecting installed dependencies...
Found 45 dependencies.
    We analyzed your package.json, there are some packages to update:
    
      Name                                    Version                  Command to update
     -------------------------------------------------------------------------------------
      @angular-eslint/schematics              14.4.0 -> 22.2.0         ng update @angular-eslint/schematics
      @angular/cdk                            14.2.7 -> 15.2.9         ng update @angular/cdk@15
      @angular/cli                            14.2.13 -> 15.2.9        ng update @angular/cli@15
      @angular/core                           14.3.0 -> 15.2.9         ng update @angular/core@15
      @angular/material                       14.2.7 -> 15.2.9         ng update @angular/material@15
    
    There might be additional packages which don't provide 'ng update' capabilities that are outdated.
    You can update the additional packages by running the update command of your package manager.
```

## 2. `npx ng update @angular/core@15 @angular/cli@15`

```text
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 15.2.11 to perform the update.
- Installing packages...
✔ Packages successfully installed.
Using package manager: npm
Collecting installed dependencies...
Found 45 dependencies.
Fetching dependency metadata from registry...
                  Package "@angular-eslint/schematics" has an incompatible peer dependency to "@angular/cli" (requires ">= 14.0.0 < 15.0.0", would install "15.2.11").
✖ Migration failed: Incompatible peer dependencies found.
Peer dependency warnings when installing dependencies means that those dependencies might not work correctly together.
You can use the '--force' option to ignore incompatible peer dependencies and instead address these warnings later.
  See "/tmp/ng-prGSEy/angular-errors.log" for further details.
```

### 2b. `npx ng update @angular/core@15 @angular/cli@15 --force`

```text
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 15.2.11 to perform the update.
- Installing packages...
✔ Packages successfully installed.
Using package manager: npm
Collecting installed dependencies...
Found 45 dependencies.
Fetching dependency metadata from registry...
                  Package "@angular-eslint/schematics" has an incompatible peer dependency to "@angular/cli" (requires ">= 14.0.0 < 15.0.0", would install "15.2.11").
    Updating package.json with dependency @angular-devkit/build-angular @ "15.2.11" (was "14.2.13")...
    Updating package.json with dependency @angular-devkit/core @ "15.2.11" (was "14.2.13")...
    Updating package.json with dependency @angular-devkit/schematics @ "15.2.11" (was "14.2.13")...
    Updating package.json with dependency @angular/cli @ "15.2.11" (was "14.2.13")...
    Updating package.json with dependency @angular/compiler-cli @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency ng-packagr @ "15.2.2" (was "14.3.0")...
    Updating package.json with dependency typescript @ "4.9.5" (was "4.7.4")...
    Updating package.json with dependency @angular/animations @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/common @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/compiler @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/core @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/forms @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/platform-browser @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/platform-browser-dynamic @ "15.2.10" (was "14.3.0")...
    Updating package.json with dependency @angular/router @ "15.2.10" (was "14.3.0")...
UPDATE package.json (2978 bytes)
- Installing packages...
✔ Packages successfully installed.
** Executing migrations of package '@angular/cli' **

▸ Remove Browserslist configuration files that matches the Angular CLI default configuration.
DELETE projects/canopy-showcase/.browserslistrc
  Migration completed (1 file modified).

▸ Remove exported `@angular/platform-server` `renderModule` method.
  The `renderModule` method is now exported by the Angular CLI.
  Migration completed (No changes made).

▸ Remove no longer needed require calls in Karma builder main file.
UPDATE projects/canopy-ui/src/test.ts (477 bytes)
UPDATE projects/canopy-showcase/src/test.ts (459 bytes)
  Migration completed (2 files modified).

▸ Update TypeScript compiler `target` and set `useDefineForClassFields`.
  These changes are for IDE purposes as TypeScript compiler options `target` and `useDefineForClassFields` are set to `ES2022` and `false` respectively by the Angular CLI.
  To control ECMA version and features use the Browerslist configuration.
UPDATE tsconfig.json (1022 bytes)
  Migration completed (1 file modified).

▸ Remove options from 'angular.json' that are no longer supported by the official builders.
  Migration completed (No changes made).

** Executing migrations of package '@angular/core' **

▸ In Angular version 15, the deprecated `relativeLinkResolution` config parameter of the Router is removed.
  This migration removes all `relativeLinkResolution` fields from the Router config objects.
  Migration completed (No changes made).

▸ Since Angular v15, the `RouterLink` contains the logic of the `RouterLinkWithHref` directive.
  This migration replaces all `RouterLinkWithHref` references with `RouterLink`.
  Migration completed (No changes made).
```

## 3. `npx ng update @angular/material@15 --force --allow-dirty`

```text
Repository is not clean. Update changes will be mixed with pre-existing changes.
Using package manager: npm
Collecting installed dependencies...
Found 45 dependencies.
Fetching dependency metadata from registry...
                  Package "@angular/flex-layout" has an incompatible peer dependency to "@angular/cdk" (requires "^14.0.0", would install "15.2.9").
    Updating package.json with dependency @angular/cdk @ "15.2.9" (was "14.2.7")...
    Updating package.json with dependency @angular/material @ "15.2.9" (was "14.2.7")...
    Updating package.json with dependency @angular/material-moment-adapter @ "15.2.9" (was "14.2.7")...
UPDATE package.json (2978 bytes)
- Installing packages...
✔ Packages successfully installed.
** Executing migrations of package '@angular/cdk' **

▸ Updates the Angular CDK to v15.
    
      ✓  Updated Angular CDK to version 15
    
  Migration completed (No changes made).

** Executing migrations of package '@angular/material' **

▸ Updates the Angular Material to v15.
    
      ✓  Updated Angular Material to version 15
    
UPDATE projects/canopy-ui/src/lib/themes/_theme.scss (3257 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/data-table/data-table.component.ts (9270 bytes)
UPDATE projects/canopy-ui/src/styles/_dense-typography.scss (1836 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/data-table/data-table.component.spec.ts (4719 bytes)
UPDATE projects/canopy-ui/src/lib/forms/currency-input/currency-input.component.ts (7788 bytes)
UPDATE projects/canopy-ui/src/lib/forms/date-range/date-range.module.ts (1249 bytes)
UPDATE projects/canopy-ui/src/lib/forms/autocomplete/autocomplete.module.ts (899 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/data-table/data-table.module.ts (955 bytes)
UPDATE projects/canopy-ui/src/lib/themes/_typography.scss (1753 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/dialog-shell/dialog-shell.module.ts (873 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/account-card/account-card.module.ts (725 bytes)
UPDATE projects/canopy-ui/src/lib/actions/menu/menu.module.ts (654 bytes)
UPDATE projects/canopy-ui/src/lib/actions/icon-button/icon-button.module.ts (676 bytes)
UPDATE projects/canopy-ui/src/lib/layout/page-shell/page-shell.module.ts (989 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/filter-chips/filter-chips.component.ts (3396 bytes)
UPDATE projects/canopy-ui/src/lib/forms/autocomplete/autocomplete.component.ts (4643 bytes)
UPDATE projects/canopy-ui/src/lib/actions/button/button.module.ts (614 bytes)
UPDATE projects/canopy-ui/src/lib/forms/amount-slider/amount-slider.component.ts (2741 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/toast/toast.module.ts (600 bytes)
UPDATE projects/canopy-ui/src/lib/forms/toggle/toggle.component.ts (2151 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/list/list.module.ts (530 bytes)
UPDATE projects/canopy-ui/src/lib/forms/checkbox/checkbox.component.ts (2024 bytes)
UPDATE projects/canopy-ui/src/lib/forms/masked-input/masked-input.module.ts (667 bytes)
UPDATE projects/canopy-ui/src/lib/forms/radio-group/radio-group.component.ts (2178 bytes)
UPDATE projects/canopy-ui/src/lib/forms/currency-input/currency-input.component.spec.ts (2612 bytes)
UPDATE projects/canopy-ui/src/lib/forms/select/select.component.ts (3391 bytes)
UPDATE projects/canopy-ui/src/lib/navigation/tabs/tabs.component.ts (1730 bytes)
UPDATE projects/canopy-ui/src/lib/feedback/progress/progress.module.ts (574 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/bottom-sheet/bottom-sheet.module.ts (609 bytes)
UPDATE projects/canopy-ui/src/lib/forms/select/select.module.ts (519 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/filter-chips/filter-chips.module.ts (599 bytes)
UPDATE projects/canopy-ui/src/lib/navigation/tabs/tabs.module.ts (532 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/dialog-shell/dialog.service.ts (1806 bytes)
UPDATE projects/canopy-ui/src/lib/actions/menu/menu.component.ts (1785 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/dialog-shell/dialog-shell.component.ts (1786 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/toast/toast.component.ts (1206 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/tooltip/tooltip.directive.spec.ts (1072 bytes)
UPDATE projects/canopy-ui/src/lib/forms/toggle/toggle.module.ts (418 bytes)
UPDATE projects/canopy-ui/src/lib/forms/currency-input/currency-input.module.ts (548 bytes)
UPDATE projects/canopy-ui/src/lib/forms/checkbox/checkbox.module.ts (415 bytes)
UPDATE projects/canopy-ui/src/lib/forms/amount-slider/amount-slider.module.ts (428 bytes)
UPDATE projects/canopy-ui/src/lib/navigation/stepper-shell/stepper-shell.module.ts (594 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/dialog-shell/confirm-dialog.component.ts (1284 bytes)
UPDATE projects/canopy-ui/src/lib/forms/radio-group/radio-group.module.ts (414 bytes)
UPDATE projects/canopy-ui/src/lib/data-display/card/card.module.ts (373 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/tooltip/tooltip.directive.ts (1320 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/toast/toast.service.ts (2597 bytes)
UPDATE projects/canopy-ui/src/lib/overlays/tooltip/tooltip.module.ts (485 bytes)
UPDATE projects/canopy-showcase/src/app/shared/shared.module.ts (2259 bytes)
UPDATE projects/canopy-showcase/src/app/pages/dashboard/dashboard-page.component.ts (8674 bytes)
UPDATE projects/canopy-showcase/src/app/pages/components/dialog-shell-page.component.ts (3804 bytes)
  Migration completed (51 files modified).
```

The Material schematic rewrote 51 files but changed nothing that the compiler would object to: it is
purely the "legacy" alias rewrite. Every `@angular/material/<x>` import became
`@angular/material/legacy-<x>` with `MatLegacyXxx as MatXxx` aliases (buttons ×11, form-field ×7,
progress-bar ×4, dialog, tooltip, menu, input, checkbox, card, tabs, table and its testing harness,
snack-bar, slider, chips, paginator harness), and in the Sass:

```scss
-  @include mat.core(ty.$cn-typography);
-  @include mat.all-component-themes($cn-light-theme);
+  // TODO(v15): As of v15 mat.legacy-core no longer includes default typography styles.
+  ...
+@include mat.all-legacy-component-typographies(ty.$cn-typography);
+@include mat.legacy-core();
+  @include mat.all-legacy-component-themes($cn-light-theme);
-      @include mat.all-component-colors($cn-dark-theme);
+      @include mat.all-legacy-component-colors($cn-dark-theme);
-$cn-typography-dense: mat.define-typography-config(
+$cn-typography-dense: mat.define-legacy-typography-config(
```

That is the whole point of the v15 step: it keeps the pre-MDC components alive under `legacy-*`
names so the build stays green, and defers every real break to v16/v17 when those entry points are
deleted. Note the `TODO(v15)` comment lands at column 0 inside the `canopy.theme` mixin body, so the
rewritten `_theme.scss` is mis-indented but still valid Sass.

## Which of T1–T17 the output warns about

Warned about, or at least visibly touched:

- **T1** typography — `_theme.scss` and `_dense-typography.scss` are rewritten to
  `define-legacy-typography-config` / `legacy-core` / `all-legacy-component-*` with the `TODO(v15)`
  comment. The v14 level names (`$display-4`, `$headline`, `$subheading-2`…) are not mentioned;
  they continue to work under the legacy config and only fail on the non-legacy
  `define-typography-config` in v17.
- **T6** moment adapter — `@angular/material-moment-adapter` is bumped to 15.2.9 in the same
  `package.json` update. No warning; it just moves.
- **T8** chips — `filter-chips.component.ts` rewritten to `MatLegacyChipList` /
  `MatLegacyChipSelectionChange`. That is the only signal that `MatChipList` is going away.
- **T9** slider — `amount-slider.component.ts` / module rewritten to `legacy-slider`. `thumbLabel`,
  `displayWith`, `tickInterval` are not flagged.
- **T15** flex-layout — the only explicit peer warning:
  `Package "@angular/flex-layout" has an incompatible peer dependency to "@angular/cdk" (requires
  "^14.0.0", would install "15.2.9")`. It does not say the package is deprecated or that
  `14.0.0-beta.41` is its last line.
- **T17** spec on Material internals — `data-table.component.spec.ts` gets the
  `MatLegacyTableHarness` / `MatLegacyPaginatorHarness` rewrite. The assertion on the internal
  class is untouched and unmentioned.
- **T3** currency input — `currency-input.component.ts` and its spec are rewritten to
  `legacy-form-field` / `legacy-input`. `MatFormFieldControl` itself is not mentioned.

Not warned about at all (the update is silent, the traps only bite when the legacy entry points are
removed or the CSS is actually rendered under MDC):

- **T2** `.mat-button-wrapper`, **T4** `.mat-select-panel` / `.mat-option`, **T5**
  `.mat-slide-toggle-bar` / `-thumb`, **T7** `.mat-header-cell` / `.mat-cell` / `.mat-row`,
  **T10** `.mat-tab-label` / `.mat-ink-bar`, **T11** `.mat-dialog-container` padding, **T12**
  `.mat-simple-snackbar` / `.mat-snack-bar-container`, **T13** `.mat-tooltip`, **T14**
  `.mat-progress-bar-fill::after`. `ng update` never reads SCSS selectors; none of these DOM
  class names appear anywhere in the output. The showcase visibly regresses only once the
  `legacy-*` modules are swapped for MDC ones.
- **T16** `bypassSecurityTrustHtml` on `cn-disclosure` — not a migration concern, nothing printed.

Also worth knowing before the demo:

- The `@angular-eslint/schematics` peer error is what blocks the plain command. It has to be
  `--force`d or `@angular-eslint/*` bumped to 15.x first; the update table proposes 22.2.0 for it,
  which is wrong for this workspace and would drag ESLint 9 in.
- The CLI migrations delete `projects/canopy-showcase/.browserslistrc`, rewrite both `test.ts`
  (drops `require.context` boilerplate — the library `test.ts` relies on `require.context` to pull
  every source file into coverage, so coverage will drop after the migration unless that is
  restored) and set `useDefineForClassFields: false` / `target: ES2022` in `tsconfig.json`.
- `typescript` moves 4.7.4 → 4.9.5 and `ng-packagr` 14.3.0 → 15.2.2. The `@types/node@16.18.11`
  pin is untouched and still needed.
- Files the Material migration touched, for cross-checking a live run: see the 51 `UPDATE` lines
  above (48 under `projects/canopy-ui`, 3 under `projects/canopy-showcase`).
