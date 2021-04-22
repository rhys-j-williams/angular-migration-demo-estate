# Changelog

All notable changes to `@meridian/canopy-ui` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the package follows semantic
versioning within the constraints in CONTRIBUTING.md (public API frozen within a major).

Entries reference CNPY tickets. Entries raised by other teams carry their own key.

## [Unreleased]

## [3.5.0] - 2023-10-19

### Added
- `cn-amount-slider` for the transfer limits screen (CNPY-1640).
- `cn-account-card`: `masked` input and reveal toggle (CNPY-1655). Card numbers are masked by
  default; see DATA_CLASSIFICATION.md.
- `cn-page-shell`: `tinted` background variant (CNPY-1671).
- `CnCurrencyFormatService.formatCompact` (CNPY-1668).

### Changed
- Bumped Angular to 14.3.0 and Material to 14.2.7. No API impact (CNPY-1622).
- `cn-data-table` sort header now uses the Material sort header harness compatible markup
  (CNPY-1633).

### Fixed
- `cn-currency-input` lost focus styling under the high density theme (CNPY-1649).

## [3.4.2] - 2023-06-15

### Fixed
- `cn-dialog-shell`: scroll lock left on body after a dialog was dismissed by route change
  (CNPY-1588).
- `cn-tooltip`: tooltip stayed open when the host was removed from the DOM (CNPY-1591).

## [3.4.1] - 2022-06-29

### Fixed
- Republish of 3.4.0. The 3.4.0 tarball was built from a dirty working tree and its `gitHead`
  does not exist on any branch (INC0412876). No code change.

## [3.4.0] - 2022-06-28

### Added
- `cn-stepper-shell` for the onboarding flows (CNPY-1402).
- `cn-progress` with `determinate` and `buffer` modes (CNPY-1419).
- `cn-badge` counts on `cn-icon-button` (CNPY-1421).

### Changed
- Angular 14. Material 14.2. TypeScript 4.7. `@angular/flex-layout` 14.0.0-beta.41
  (CNPY-1380). Consumers must be on Angular 14 to take this release; 3.3.x remains available for
  Angular 13.
- `.mat-form-field-underline` alignment for the currency input prefix reworked for the 14
  form field DOM (CNPY-1388).

### Removed
- `CnLegacyThemeModule`. It was a no-op since 3.1.0.

## [3.3.1] - 2022-03-10

### Fixed
- `cn-date-range`: `MAT_DATE_FORMATS` parse format accepted two digit years and produced dates in
  the year 20 (CNPY-1341).

## [3.3.0] - 2022-02-03

### Added
- `cn-date-range` on `MatMomentDateModule` with the bank's `MM/DD/YYYY` formats (CNPY-1288).
  Moment is a peer dependency because every consumer already has it.
- `cn-expansion`, `cn-list`, `cn-divider` (CNPY-1290, CNPY-1291, CNPY-1292).
- `cn-menu` (CNPY-1301).

### Changed
- Angular 13, Material 13 (CNPY-1275).

## [3.2.0] - 2021-11-04

### Added
- `cn-tabs` with `cnTab` content projection and badge slots (CNPY-1188).
- `cn-filter-chips` on `MatChipList` with `selectable` chips and a `selectionChange` event
  (CNPY-1201). Replaces the copy in Meridian Business.
- `cn-data-table` density input, `compact` and `default` (CNPY-1212).
- `cnFocusTrap` directive (CNPY-1219).

### Fixed
- `cn-toggle` thumb colour in the disabled state (CNPY-1230).

## [3.1.0] - 2021-08-19

### Added
- Secondary entry points per component family. The root entry point still re-exports everything
  so nothing breaks, but consumers should move to `@meridian/canopy-ui/<family>` for tree shaking
  (CNPY-1104, ADR-0002).
- `ng add` schematic that adds the theme import and copies the sprite (CNPY-1120).
- Public API reports under `docs/api`, regenerated on build (CNPY-1131).

### Changed
- Angular 12, Material 12 (CNPY-1090).
- Tokens now also emitted as CSS custom properties (CNPY-1098).

### Removed
- `CnLegacyThemeModule` no longer does anything. Kept exported for one more minor.

## [3.0.1] - 2021-05-06

### Fixed
- `cn-button` icon gap collapsed when the icon was the only content (CNPY-1042).
- `cn-select`: panel class was applied to the wrong overlay pane when two selects were open
  (CNPY-1047).

## [3.0.0] - 2021-04-22

Rewrite of the 2.x library on Angular Material with the Sass module system. Everything from 2.x
was renamed to the `cn` prefix and the Bootstrap based components were dropped. Migration notes
are in the 3.0 migration guide on the wiki.

### Added
- `cn-button`, `cn-icon-button`, `cn-account-card`, `cn-currency-input`, `cn-masked-input`,
  `cn-select`, `cn-autocomplete`, `cn-checkbox`, `cn-radio-group`, `cn-toggle`, `cn-data-table`,
  `cn-dialog-shell`, `cn-toast`, `cn-tooltip`, `cn-card`, `cn-page-header`, `cn-page-shell`.
- Light theme through `canopy.theme()` using `mat.define-typography-config`,
  `mat.define-palette` and `mat.all-component-themes`.
- SVG sprite registered through `MatIconRegistry` under the `cn` namespace.
- `CnCurrencyFormatService`.

### Removed
- Everything from 2.x. See the migration guide.

[Unreleased]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.5.0...develop
[3.5.0]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.4.2...canopy-ui/v3.5.0
[3.4.2]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.4.1...canopy-ui/v3.4.2
[3.4.1]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.4.0...canopy-ui/v3.4.1
[3.4.0]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.3.1...canopy-ui/v3.4.0
[3.3.1]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.3.0...canopy-ui/v3.3.1
[3.3.0]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.2.0...canopy-ui/v3.3.0
[3.2.0]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.1.0...canopy-ui/v3.2.0
[3.1.0]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.0.1...canopy-ui/v3.1.0
[3.0.1]: https://git.meridian.internal/cswt/canopy-ui/compare/canopy-ui/v3.0.0...canopy-ui/v3.0.1
[3.0.0]: https://git.meridian.internal/cswt/canopy-ui/releases/tag/canopy-ui/v3.0.0
