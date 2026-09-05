# Playbooks

Two playbooks to load into Devin before the demonstration. Paste each one into a new playbook in
the Devin web application. They are written to be run repeatedly, once per Angular major, across
every repository in the estate.

The first is the workhorse: one Angular major step, in one repository, with gates. The second is
the one that makes the room sit up, because it stops and asks a human to look at screenshots.

---

## Playbook one — Angular major version step

**Name:** Angular major version step (Meridian estate)

**When to use:** upgrading any Meridian Angular repository by exactly one major version. Run it
against `canopy-ui` first, then against consumers once the library is republished.

### Overview

Meridian's front end estate is a shared component library, Canopy, and five applications that
consume it. A framework upgrade is therefore a train, not a task: the library moves, publishes, and
only then can the applications move. Each application is pinned to an exact Canopy version, and one
of them is two minor versions behind, so it needs two hops.

This playbook takes one repository up exactly one Angular major. It does not tidy, modernise or
refactor beyond what the compiler and the schematics require. Anything you notice that is worth
doing but is not required goes into the deferred list in the migration report, not into the branch.

### Required inputs

Ask for any of these that were not supplied before starting:

- `repository` — which Meridian repository to upgrade
- `from_version` and `to_version` — the Angular majors, which must be adjacent
- `canopy_version` — for a consumer, the Canopy version to move to, or `unchanged` for the library
- `ticket_key` — the Jira key to use in the branch name and every commit
- `cab_reference` — the change advisory board reference, or `none` for a non-production branch

### Procedure

1. **Establish the baseline.** Check out `develop`. Use the Node version in `.nvmrc`. Run
   `npm ci`, then lint, unit tests and a production build, and record the results. If the baseline
   is not green, stop and report — you cannot attribute failures after the fact.
2. **Read the estate's own notes before touching anything.** `_demo-notes/TRAPS.md`,
   the repository's `docs/` directory, its `Known Issues` section, and any `SPIKE_NOTES.md`.
   Somebody may have tried this before and written down why they stopped.
3. **Inventory what will break.** Before running any schematic, list: Material internal class
   selectors, deprecated or removed APIs for `to_version`, packages whose peer dependencies do not
   admit `to_version`, packages that are unmaintained or end of life at `to_version`, and any
   package published in View Engine format. Put this list in the migration report first. It is the
   most valuable artefact of the whole run.
4. **Run the official migration.** `npx ng update @angular/core@<to> @angular/cli@<to>` followed by
   the Material update where Material is present. Let the schematics do their work; read what they
   changed rather than assuming.
5. **Fix the compile.** Work through the errors in dependency order. Prefer the migration the
   Angular team documents over an invention of your own. Where a component has genuinely been
   rewritten upstream — chips, slider, form field — rewrite against the new API rather than
   patching the old shape back into place.
6. **Retarget style overrides deliberately.** Every `.mat-*` selector that no longer matches is a
   visual regression waiting to happen. Retarget it, and note in the report that it needs visual
   review. Do not delete an override to make a build pass.
7. **Repair tests honestly.** A test that asserted an internal Material class has broken for a good
   reason: rewrite it against behaviour. Never delete, skip or `xit` a test to reach green, and
   never lower a coverage threshold.
8. **Update the peer dependency story.** For the library, the published `peerDependencies` must
   admit the new Angular. For a consumer, remove any local `patch-package` patch or compatibility
   shim that the new library version makes unnecessary.
9. **Run the gates** below.
10. **Write the migration report** using `_demo-notes/MIGRATION-REPORT-TEMPLATE.md` and attach it to
    the pull request.
11. **Open the pull request** against `develop`, titled `<ticket_key> upgrade <repository> to
    Angular <to_version>`, with the CAB reference, the risk rating, the rollback plan and the
    accessibility result filled in.

### Verification gates

All of these must pass before you open the pull request. Report each one explicitly, pass or fail:

- `npm ci` completes with the repository's own `.npmrc`
- the library builds (`ng build canopy-ui --configuration production`) where applicable
- **every consumer of the library still builds** against the newly built package — this gate is the
  point of the estate, and it is the one people forget
- unit tests pass and coverage is within three points of the pre-upgrade number
- lint passes with no new errors
- a production build succeeds for every configuration, including the localised builds
- `npx axe` (or the project's accessibility script) against the Canopy showcase reports no new
  violations
- the migration report exists and is complete

### Forbidden actions

- **Never skip a major version.** 14 to 16 in one step is not this playbook.
- **Never edit authentication, session or MFA code** beyond what compatibility strictly requires.
  Keystone integration changes go to the Identity Platform team.
- **Never add a dependency** to solve an upgrade problem without asking first.
- **Never change Canopy's public API without a major version bump.** The API is frozen within a
  major; that is in `canopy-ui/CONTRIBUTING.md` and consumers rely on it.
- **Never silently change security-relevant behaviour** — sanitisation, CSP, XSRF configuration,
  token handling. Flag it, do not fix it.
- **Never turn on `strict` or `strictTemplates`** as part of an upgrade. Separate story.
- **Never delete or weaken a test** to reach green.

### Structured output

Return a migration report object:

```json
{
  "repository": "canopy-ui",
  "angular_from": "14.3.0",
  "angular_to": "15.2.10",
  "schematics_applied": ["@angular/core:migration-v15", "@angular/material:mdc-migration"],
  "files_changed": {"source": 0, "templates": 0, "styles": 0, "tests": 0, "config": 0},
  "breaking_changes_handled": [{"id": "T8", "summary": "", "resolution": ""}],
  "tests": {"before": {"passed": 0, "failed": 0, "coverage": 0.0},
            "after":  {"passed": 0, "failed": 0, "coverage": 0.0}},
  "consumers_verified": [{"repository": "retail-web", "builds": true, "notes": ""}],
  "accessibility": {"tool": "axe", "new_violations": 0},
  "visual_review_required": ["cn-filter-chips", "cn-amount-slider"],
  "deferred": [{"item": "", "why": "", "suggested_ticket": ""}],
  "risk_rating": "medium",
  "rollback_plan": ""
}
```

---

## Playbook two — Canopy Material migration

**Name:** Canopy Material migration with human visual review (Meridian estate)

**When to use:** the Angular Material MDC migration inside `canopy-ui`, at the 15 step and again at
the 17 step. This playbook deliberately **stops in the middle** and waits for a human.

### Overview

Canopy wraps Angular Material and, over four years, has reached into Material's internal DOM in
seventeen places to meet Meridian's brand and density standards. The MDC migration changes that
internal DOM. The mechanical part is tractable; the visual part is not, because only a designer can
say whether a four pixel shift in a chip's padding is acceptable on the transaction filter bar.

So: inventory, migrate mechanically, produce evidence, then stop and ask. Do not decide visual
questions on the bank's behalf.

### Required inputs

- `target_version` — the Angular Material major being migrated to
- `reviewers` — who signs off the visual review (design system team plus the consuming team)
- `showcase_url` — normally `http://localhost:4204`

### Step 1 — Inventory

Produce a table, before changing anything, of every place Canopy depends on Material's internals:

- every `.mat-*` selector in a component stylesheet or global theme, with its component and the
  reason it exists (read the git history and blame — most of them have a ticket)
- every legacy import path and `MatLegacy*` symbol
- every component whose upstream API is rewritten rather than renamed, which for the 15 step means
  chips, slider, form field, and for the 17 step means everything still on legacy
- every test that asserts on Material internal DOM
- every consumer that overrides Canopy or Material styles from outside the library, which for this
  estate means `business-web`'s `::ng-deep` blocks and `ledgerline-web`'s `canopy-compat`

Post the inventory before proceeding. It is what the design system team will argue about.

### Step 2 — Mechanical migration

Run the official Material schematics. Then, component by component in the inventory order:

- move legacy imports to their MDC equivalents and delete the legacy theme mixin once nothing needs
  it
- retarget each internal selector to the MDC structure, keeping the *intent* of the override (a gap,
  a density, a brand colour) rather than the literal declaration
- rewrite components whose API changed, against the new API
- rewrite tests that asserted internal classes so they assert behaviour

Keep one commit per component family, with the ticket key. A reviewer needs to be able to look at
`cn-filter-chips` on its own.

### Step 3 — Evidence

For every component in the inventory, capture evidence:

- start the Canopy showcase and screenshot each component's showcase page in light, dark and high
  contrast themes, at desktop and mobile widths
- record a short desktop session driving the interactive components — the data table with sorting
  and selection, the filter chips, the slider, the date range picker, the dialog and the toast
- run the accessibility check on every showcase page and diff the violations against the baseline
- build every consumer against the migrated library and screenshot the pages that use the changed
  components, at minimum Meridian Online's transaction list and transfer flow

Name every screenshot after the component and theme, and attach them all.

### Step 4 — Stop for human decision

**Stop here. Do not open a pull request. Do not merge. Do not continue to the next component
family.**

Post a message to the reviewers containing: the inventory table with each row marked migrated,
rewritten or deferred; the before and after screenshots side by side; the accessibility diff; the
list of components where the MDC equivalent has no feature parity, with the specific behaviour that
is lost; and a clear question for each of those.

For this estate the known parity gaps are the slider's `tickInterval` and thumb label behaviour, the
chips' selection semantics, and the form field's prefix alignment, which `cn-currency-input` depends
on. Expect to ask about all three.

Then wait. When the reviewers respond, apply their decisions, re-capture evidence for anything that
changed, and only then open the pull request with the full evidence pack attached.

### Forbidden actions

- **Never accept a visual change on the bank's behalf.** Brand and density are signed off by design,
  not by engineering.
- **Never proceed past step 4 without a human answer**, even if the change looks obviously correct.
- **Never drop an override** because the MDC equivalent looks close enough.
- **Never change `cn-disclosure`'s sanitisation behaviour** while you are in the neighbourhood. It
  is a known security review item with its own ticket, and regulatory disclosure markup has to
  render exactly as the content team supplies it.
- **Never bump the Canopy minor version** for this work. An MDC migration is a major.
