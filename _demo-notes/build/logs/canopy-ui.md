# Build log: canopy-ui

Estate construction notes for the Canopy design system slice. Phase 1, September 2026. Merged into
the root BUILD_LOG.md by the parent session.

Branch: `feature/CNPY-2140-design-system-build`. Ticket key CNPY.

## Environment

- Node 16.20.2 via nvm, npm 8.19.4. Chrome 133 at `~/.local/bin/google-chrome`, `CHROME_BIN`
  exported for Karma.
- Angular CLI and framework 14.3.0, Material and CDK 14.2.7, ng-packagr 14.3.0, TypeScript 4.7.4,
  RxJS 7.5.7, zone.js 0.11.8, Sass 1.54.9, `@angular/flex-layout` 14.0.0-beta.41, Moment 2.29.4,
  ngx-mask 14.3.3. All exact in `canopy-ui/package.json`, lockfile committed.
- `@types/node` pinned to 16.18.11 as per the phase 0 note. Confirmed the `Disposable` failure
  without it.
- `.npmrc` in `canopy-ui/` carries `legacy-peer-deps=true` (flex-layout's peer range),
  `puppeteer_skip_download=true`, `save-exact=true` and the `@meridian:registry` line for Verdaccio
  with the Artifactory pattern commented.

## Substitutions and workarounds

- **Showcase theme import.** The showcase builds inside the workspace against `dist/canopy-ui`
  through tsconfig paths, but Sass has no equivalent path mapping, so
  `projects/canopy-showcase/src/styles.scss` does `@use '../../canopy-ui/src/lib/themes'` rather
  than `@use '@meridian/canopy-ui/styles'`. A real consumer uses the package path; the showcase
  is the one place the relative import is acceptable.
- **Showcase bundle budget.** Raised to 2.5 MB warning / 3 MB error for the showcase project
  only. It imports every entry point plus Moment; the default 1 MB budget is meant for
  applications. `moment` and `@meridian/domain-fixtures` are listed in
  `allowedCommonJsDependencies` for the same reason.
- **Angular 14 metadata evaluation.** `declarations: [...COMPONENT_PAGES.map(p => p.component)]`
  is rejected by the 14 compiler (NG1010, not statically analysable). The showcase keeps a literal
  `COMPONENT_PAGE_COMPONENTS` array next to the page list.
- **Moment interop.** With `esModuleInterop` off, `import * as moment from 'moment'` is not
  callable at runtime under the CLI's webpack 5. The date range component uses the pattern from
  the Material docs (`_rollupMoment || _moment`) and `allowSyntheticDefaultImports` is on in the
  root tsconfig. The MatMomentDateModule usage (trap T6) is unchanged.
- **ngx-mask provider.** `NgxMaskModule.forChild()` in the masked input module left standalone
  showcase routes without the config token. Changed to `forRoot()` in the library module. Same
  outcome for consumers that import the forms entry point once.
- **Coverage denominator.** Karma with Angular's builder only instruments files that a spec
  imports, and the library package is `sideEffects: false` so a barrel import is tree shaken out
  of the test bundle. `src/test.ts` now `require.context`s every non spec `.ts` under `src/lib`
  and `tsconfig.spec.json` includes `src/**/*.ts`. With that, coverage went from 77 percent
  (specs only) to 52 percent (all files). Whole creation-only spec files were then deleted for the
  simpler components until the figure landed at 47.4 percent lines. No assertion was weakened and
  every trap spec, including the data table harness spec that asserts `.mat-header-cell` (T17),
  is intact. Files that lost their spec: theme service, account card, virtual list, autocomplete,
  masked input, error summary, stepper shell, menu, icon button, announcer, skip link, focus trap,
  expansion, list, skeleton, card, badge, divider, bottom sheet, checkbox, radio group, currency
  format service. This means the brief's "every component has a spec" is not literally true after
  thinning; the user's instruction to reach ~48 percent by deleting whole specs took precedence.
- **T1 path.** `scripts/verify-traps.sh` looks for `$subheading-2` under
  `projects/canopy-ui/src/styles`, while the theme lives under `src/lib/themes` (shipped as the
  `themes` asset). Added `src/styles/` as the consumer facing SCSS entry
  (`@use '@meridian/canopy-ui/styles'`) forwarding tokens and themes, plus a dense typography
  variant using the same v14 level names. Both locations now carry the trap.
- **CRLF files.** `* text=auto eol=lf` in `.gitattributes` would normalise the two CRLF files on
  commit, so they are marked `-text` explicitly and the attribute block says why. Files:
  `projects/canopy-ui/src/lib/tokens/_legacy-tokens.scss` and
  `projects/canopy-ui/src/lib/forms/masked-input/masked-input.component.scss`. `git ls-files
  --eol` shows `i/crlf` for both.
- **Lint.** The workspace had `@angular-eslint` 14.4.0 in devDependencies but no lint target.
  Added the builder targets and `.eslintrc.json` files. Three findings fixed (two useless escapes,
  one input alias suppressed inline for `cnColumnDef`, which is aliased on purpose to match the
  Material `matColumnDef` shape).
- **Forbidden strings scan and the CLI cache.** `scripts/check-forbidden-strings.sh worktree`
  scans `.angular/cache`, which contains vendored Material sources and hits the list. Delete
  `canopy-ui/.angular` before running; it is gitignored and the scan of tracked files is clean.
- **Publish script.** `scripts/publish.sh` reads the version from a `canopy-ui/vX.Y.Z` tag,
  refuses a mismatch with `projects/canopy-ui/package.json`, builds, stamps `gitHead` and
  `npm publish`es to `NPM_REGISTRY` (default Verdaccio). `DRY_RUN=1` supported.
- **Docker base images.** The Dockerfile references Red Hat UBI Node 16 and nginx 1.20 images as
  the brief describes; the image has not been built on this box (no registry access and not
  needed for the estate story).

## Runtime fixes made during showcase smoke testing

These are genuine defects found while clicking through the showcase, fixed as a 2024 team would
have; none touch a trap.

- `cn-tabs` threw `ExpressionChangedAfterItHasBeenChecked` when projected `cnTab` badges changed.
  `ngAfterContentChecked` + `markForCheck`.
- `cn-select` rebuilt the optgroup array on every check, causing `ngFor` to tear down the panel
  contents. Memoised on the options reference.

## Verification results

Recorded as run; see the session for the exact terminal output.

- `npm run build` (library, 11 entry points + schematics + asset copy): pass.
- `npm run build:showcase` (production): pass, within the raised budget.
- `ng serve` on 4204: served; `/`, `/dashboard`, foundations and component routes smoke tested;
  sprite at `/assets/canopy/canopy-sprite.svg` returns 200.
- `npm test`: 47 specs, 47 pass, lines 47.41 percent (523/1103), gate 45.
- `npm run lint`: both projects pass.
- `npm run api:report`, `npm run changelog:check`: pass.
- `scripts/verify-traps.sh T1 ... T17 T48`: all PRESENT after the `src/styles` addition.
- `scripts/check-forbidden-strings.sh worktree`: PASS (after clearing `.angular`).

## Open items at time of writing

Tracked in the session task list: Verdaccio publish of 3.5.0 and 3.7.2 with tags, then the
synthetic history replay.
