# MOL-3801 Angular 15 spike, notes

Blake Arceneaux, retail-digital, Plano. Spike ran 2024-02-12 to 2024-02-23. Branch
`feature/MOL-3801-angular15-spike`, cut from `develop` at v2024.02.1. Abandoned. These notes were
cherry-picked back to `develop` so people stop asking me in chat.

The branch is the real thing, not a write-up. `ng update @angular/core@15 @angular/cli@15` was
run and committed as-is, then I spent eight working days trying to make it compile. It does not.
If you check it out and run `npm ci && npm run build` you will see what I saw.

## What ng update did on its own

- `@angular/*` to 15.2.x, `@angular/cli` 15.2.x, TypeScript to 4.9.5, zone.js to 0.12.
- Migration for `relativeLinkResolution` removed the option from `app-routing.module.ts`. Fine.
- Migration removed `RouterModule.forRoot` `initialNavigation: 'enabledBlocking'`... no it did
  not, that stays. Ignore this line, leaving it so the diff makes sense.
- Material 15 came along because Canopy 3.7.2 peers on `@angular/material` 14 and npm with
  `legacy-peer-deps` just lets it happen. First sign of trouble.

## Why it does not compile, in the order I hit them

### 1. Canopy against Material 15 (the big one)

Material 15 swapped the default components for the MDC versions. Canopy 3.7.2's SCSS overrides
target `.mat-form-field-flex`, `.mat-form-field-underline`, `.mat-select-arrow-wrapper`,
`.mat-slide-toggle-bar`, and about forty others that are gone or renamed. The build passes the
SCSS stage (they are just selectors) but every form on the site renders unstyled, and the Canopy
`cn-toggle` wraps `MatSlideToggle` whose API changed enough that `CnToggleComponent` throws
`NG0303` at runtime.

Tried pinning `@angular/material` to 14.2.7 with Angular core at 15. `ng build` fails with
`NG6002` on `MatCommonModule` because Material 14's compiled output references Angular 14 Ivy
partial compilation metadata that 15's linker rejects. Tried `--force`. It compiled and rendered a
blank page with no console errors, which was the point at which I stopped being clever.

Spoke to Hanne on the Canopy team. Canopy 4 (Material 15 + legacy components as a bridge) is
estimated at 3-4 months and is not funded for 2024. Business Online is on Canopy 3.5.0 and would
have to move too. This alone blocks the upgrade regardless of anything below.

### 2. flex-layout

`@angular/flex-layout` 14.0.0-beta.41 is the last version and its peer range is exactly Angular
14. It compiles under 15 with a warning but `fxLayout.lt-md` and the other responsive suffixes
stopped reacting to breakpoints. I did not get to the bottom of it; suspect the `MediaMarshaller`
change in CDK 15. Counted our usages: 113 `fxLayout`/`fxFlex`/`fxLayoutGap` occurrences in 47
templates, 19 of them responsive. Replacing it is a proper piece of work with visual regression
on every screen, not a spike task.

### 3. Lantern SDK

Still compiles under 15 because `ngcc` still exists in 15. It goes in 16. The vendor still has no
Ivy build (LNTN-140, opened May 2022). Femi in DAE says the vendor's roadmap has it in "H2" with
no year. Not a 15 blocker, a 16 blocker, but pointless to do 15 and then stop.

### 4. Everything smaller

Listed so nobody has to rediscover them. None of these are hard, they are just many.

- `CanLoad` deprecated in 15.1, still works. `LazyModuleGuard` will need `CanMatch` eventually.
- `HttpClientXsrfModule.withOptions` fine at 15. Goes away with the module in 17-ish.
- Six `.toPromise()` calls in cards and statements. Deprecated since RxJS 7, removed in 8.
  `firstValueFrom` swap. Trivial but the card-detail one has a subtle behaviour difference on
  empty streams (`toPromise` resolves undefined, `firstValueFrom` throws).
- `UntypedFormBuilder` in profile and onboarding. Compiles, stays untyped. ADR 0012.
- `zone.js/dist/zone` deep import in `polyfills.ts`. Fine at 15, the `dist/` path goes in
  zone.js 0.14.
- `tsconfig.json` has `strict: false`, `strictTemplates: false`. TypeScript 4.9 found nothing new
  because we check nothing. Turning strict on found 600+ errors; I did not count exactly.
- Two Protractor specs and three page objects in `e2e/`. Dead. Delete when someone is brave.
- The `overrides` for `minimist` and `loader-utils` conflict with what CLI 15 wants. Removed them
  on the branch; the audit came back with three new advisories instead of two.
- `@types/node` needs to move off 16.18.11 for TS 4.9, and then the `Disposable` thing comes
  back in a different form.

### Tests

Did not get far enough to run them meaningfully. `ng test` compiles under 15 with Canopy forced;
53 specs fail, mostly `NG0303` from Canopy components, so not informative.

## Recommendation

Do not attempt 15 on its own. Sequence it: Lantern replacement or vendor Ivy build first (external
dependency, longest lead time), Canopy 4 alongside `business-web`, flex-layout to CSS with visual
regression, then the framework. That is a quarter of the team, probably two. Wrote it up for the
architecture review; see ADR 0014 when it lands.

Branch left as-is. Last commit on it is the one where I gave up. Do not rebase it onto anything.

