# Migration report — <repository> Angular <from> to <to>

> Evidence pack for one Angular major step in one repository. Attach it to the pull request. The
> change advisory board reads the summary and the rollback plan; the reviewing engineer reads
> everything else. Delete nothing — a section with "none" in it is information.

**Ticket:** `<KEY>-####`
**CAB reference:** `CHG#######` or `none — non-production branch`
**Prepared by:** Devin session `<url>`
**Reviewed by:** `<name>` — *required before merge*
**Date:** `YYYY-MM-DD`
**Risk rating:** low / medium / high
**Release train:** `2026.MM.N`

---

## 1. Versions

| Package | Before | After |
| --- | --- | --- |
| `@angular/core` | | |
| `@angular/cli` | | |
| `@angular/material` | | |
| `@angular/cdk` | | |
| `@meridian/canopy-ui` | | |
| `typescript` | | |
| `rxjs` | | |
| `zone.js` | | |
| Node (`.nvmrc`) | | |

Other dependency changes, with the reason for each:

| Package | Before | After | Why |
| --- | --- | --- | --- |
| | | | |

Dependencies **not** moved, and what blocks them:

| Package | Current | Blocked by | Owning team |
| --- | --- | --- | --- |
| | | | |

## 2. Schematics applied

| Schematic | Outcome | Files touched | Notes |
| --- | --- | --- | --- |
| | | | |

Anything the schematics changed that was then reverted or reworked by hand, and why:

## 3. Files changed by category

| Category | Files | Lines added | Lines removed |
| --- | --- | --- | --- |
| Source (`.ts`) | | | |
| Templates (`.html`) | | | |
| Styles (`.scss`) | | | |
| Tests (`.spec.ts`) | | | |
| Configuration | | | |
| Documentation | | | |
| **Total** | | | |

## 4. Breaking changes handled

One row per genuine break. Reference the trap id from `_demo-notes/TRAPS.md` where one applies.

| Trap | What broke | How it was resolved | Behaviour change? |
| --- | --- | --- | --- |
| | | | |

## 5. Style overrides retargeted

Every Material internal selector that stopped matching. These are the visual regression risk.

| Component | Old selector | New selector | Visual review needed |
| --- | --- | --- | --- |
| | | | |

## 6. Tests

| | Before | After |
| --- | --- | --- |
| Suites | | |
| Tests passed | | |
| Tests failed | | |
| Tests skipped | | |
| Line coverage | | |

Tests rewritten, and why each one had to change:

| Spec | Reason | Still asserting the same behaviour? |
| --- | --- | --- |
| | | |

> Coverage must be within three points of the before number. A test was **not** deleted, skipped or
> weakened to reach green. Confirm explicitly: `yes / no — explain`

## 7. Build and lint

| Gate | Command | Result |
| --- | --- | --- |
| Clean install | `npm ci` | |
| Lint | | |
| Unit tests | | |
| Production build | | |
| Localised build (`es`) | | |
| Library package build | | |

## 8. Consumer verification

Only for a `canopy-ui` step. Every consumer must build against the newly published library.

| Consumer | Canopy before | Canopy after | Builds | Tests | Notes |
| --- | --- | --- | --- | --- | --- |
| `retail-web` | | | | | |
| `business-web` | | | | | |
| `keystone-web` | | | | | |
| `ledgerline-web` | | | | | |
| `iris-widget` | | | | | |

## 9. Accessibility

| Check | Tool | Baseline violations | After | New violations |
| --- | --- | --- | --- | --- |
| Canopy showcase | axe | | | |
| Key application journeys | axe | | | |

New violations must be zero. If they are not, list each one with the component and the plan.

## 10. Visual evidence

| Component / screen | Theme | Before | After | Verdict |
| --- | --- | --- | --- | --- |
| | light / dark / high contrast | | | unchanged / accepted / needs design |

Rows marked *needs design* block the merge until the design system team signs them off.

## 11. Known deferred items

Everything noticed and deliberately not done in this pull request.

| Item | Why deferred | Suggested ticket | Priority |
| --- | --- | --- | --- |
| | | | |

## 12. Security review

| Question | Answer |
| --- | --- |
| Authentication, session or MFA code touched? | |
| Sanitisation or CSP behaviour changed? | |
| XSRF configuration changed? | |
| New dependencies introduced? | |
| Registry or install configuration changed? | |
| Requires `@meridian/gis-appsec` review? | |

## 13. Rollback plan

How to get back, how long it takes, and who does it. Name the artefact version to redeploy and the
first thing to check afterwards.

## 14. Sign off

| Role | Name | Date |
| --- | --- | --- |
| Preparing engineer | | |
| Reviewing engineer | | |
| Design system (visual changes) | | |
| GIS AppSec (security-relevant changes) | | |
| Change advisory board | | |
