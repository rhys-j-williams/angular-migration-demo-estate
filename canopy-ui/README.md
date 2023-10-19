# Canopy design system (`@meridian/canopy-ui`)

| | |
|---|---|
| Owning team | Canopy design system (`@meridian/canopy-design-system`), part of CSWT |
| Jira | `CNPY` |
| Chat | `#canopy-design-system`, `#canopy-consumers` for questions from app teams |
| On call | Canopy is not paged. Consumer incidents route to the consuming application's rota; the Canopy rota (`CSWT-CANOPY-L2`, business hours ET) is engaged by the incident commander when a defect is traced to the library. See the runbook under `docs/runbooks/`. |
| Current version | 3.7.2 (`develop`), 3.5.0 still consumed by Meridian Business |
| Angular | 14.3.0, Material 14.2.7, Node 16.20.2 |

Canopy is the bank's Angular component library. It wraps Angular Material with the Meridian
design tokens, adds the components Material does not have (account card, currency input, filter
chips with our semantics, error summary, disclosure) and carries the accessibility behaviour that
the digital accessibility standard (DAS-2.1) requires of every customer facing screen.

Consumers and the version they are on, as of the 2026.09 train:

| Application | Version | Notes |
|---|---|---|
| retail-web (Meridian Online) | 3.7.2 | |
| business-web (Meridian Business) | 3.5.0 | Pinned exactly. See MBZ-2210, blocked on their RxJS 6 work. |
| ledgerline-web | 3.7.2 | Carries patches against the published package. We have asked them to stop (LDG-3104). |
| keystone-web | 3.6.1 | |
| iris-widget | 3.7.2 | `cn-toast` and icons only. |

## Layout

```
projects/canopy-ui            the library. One secondary entry point per component family:
  src/lib/core                config token, theme service, currency formatting
  src/lib/icons               MatIconRegistry sprite registration
  src/lib/a11y                announcer, focus trap, skip link
  src/lib/actions             button, icon button, menu
  src/lib/forms               inputs, select, autocomplete, checkbox, radio, toggle, date range, slider
  src/lib/data-display        account card, data table, virtual list, filter chips, badge, skeleton, card, list, expansion, divider
  src/lib/navigation          tabs, stepper shell
  src/lib/overlays            dialog shell, bottom sheet, toast, tooltip
  src/lib/feedback            progress, error summary
  src/lib/layout              page header, page shell
  src/lib/content             disclosure
  src/lib/tokens              SCSS tokens and the CSS custom property sheet
  src/lib/themes              light and high contrast. `canopy.theme()` is the consumer mixin.
  src/styles                  consumer facing SCSS entry (`@use '@meridian/canopy-ui/styles'`)
  schematics/ng-add           installs the theme import and the sprite asset
projects/canopy-showcase      living style guide, port 4204
docs/api                      generated public API reports, committed, diffed in review
docs/adr, docs/runbooks
scripts/                      publish, api report, changelog gate, asset copy
```

Consumers import from the entry point, never from a deep path:

```ts
import { CnDataTableModule } from '@meridian/canopy-ui/data-display';
```

## Build

Node comes from `.nvmrc`. Nothing else is supported; the Jenkins agent is `nodejs16-rhel8`.

```
nvm use
npm ci
npm run build              # library to dist/canopy-ui, then schematics and asset copy
npm run build:showcase     # showcase to dist/canopy-showcase
npm test                   # Karma, ChromeHeadless, coverage gate at 45 percent lines
npm run lint
npm run api:report         # regenerate docs/api, commit the result
```

`npm ci` needs the registry in `.npmrc`. On a developer laptop that is the internal Artifactory
virtual; in the estate build it is the local Verdaccio on 4873. Do not put `legacy-peer-deps` on
the command line, it is already in `.npmrc` because of `@angular/flex-layout`'s peer range.

`CHROME_BIN` must point at a Chrome. The RHEL agents have it in `/opt/google/chrome/chrome`; on
a laptop `karma.conf.js` will find a system Chrome. Puppeteer's bundled download is switched off
in `.npmrc` because the proxy blocks it.

## Run the showcase

```
npm start                  # http://localhost:4204
```

The showcase is self contained. It does not call any service; the dashboard pages are driven by
`@meridian/domain-fixtures` (seeded, deterministic). There is nothing to run from
`mock-external` for Canopy itself. If you want to see a component inside a real application, run
retail-web against the mock stack and point its `.npmrc` at a Verdaccio you have published to
(see `docs/runbooks/publish-a-release.md`, section "Local publish").

## Publishing

Releases are cut from tags of the form `canopy-ui/v3.7.2` and published by Jenkins through
`scripts/publish.sh`. The version in `projects/canopy-ui/package.json` must match the tag and have
a `CHANGELOG.md` entry (`npm run changelog:check` is the gate). Never `npm publish` from a
laptop. The one time that happened (3.4.1, June 2022) it shipped a build from a dirty working tree
and the `gitHead` in the package did not exist; INC0412876.

## Theming

Consumers include the theme once, in their root stylesheet:

```scss
@use '@meridian/canopy-ui/styles' as canopy;
@include canopy.theme();               // light, plus high contrast under a body class
```

`ng add @meridian/canopy-ui` does this for a new application and copies the sprite into
`assets/canopy`. Tokens are available both as SCSS variables (`canopy.$cn-space-4`) and as CSS
custom properties (`var(--cn-space-4)`); prefer the custom properties in application code so
theme switching works without a rebuild.

## Known issues

- CNPY-2031 `cn-select` panel width does not follow the trigger when the trigger is inside a
  `cn-page-header` action slot. Workaround: set `panelClass="cn-select-panel--wide"`.
- CNPY-1977 `cn-date-range` emits twice when the end date is picked with the keyboard. Harmless
  but noisy in NgRx effects; retail-web debounces it.
- CNPY-2088 `cn-virtual-list` loses scroll position on theme switch. Only the showcase switches
  theme at runtime so nobody has prioritised it.
- CNPY-1866 the dense typography scale in `src/styles/_dense-typography.scss` is not covered by
  the showcase and has drifted from the Figma dense styles at least once.
- CNPY-2114 `ng add` schematic does not handle workspaces whose root stylesheet is `.css`. It
  prints a warning and leaves the import for the developer to add.
- Sass prints deprecation warnings for `/` division from within `@angular/material` 14. Ours are
  clean; theirs are not ours to fix.
- The showcase build exceeds the default CLI initial budget because it imports every entry point
  and Moment. The budget is raised for the showcase only; the library has no bundle budget.

## Angular upgrade position

Canopy is on Angular 14 and is the reason the consuming applications are too. The architecture
forum's position (ADR-0004) is that the Material 15 MDC migration is a Canopy major, not a minor,
because most of the component styling reaches into Material's pre MDC class names. Consumers
should plan for a Canopy 4.0.0 alongside their Angular 15 plus work. Do not try to do the upgrade
inside a feature branch.
