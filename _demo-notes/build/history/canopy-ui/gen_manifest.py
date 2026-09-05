#!/usr/bin/env python3
"""Generate the canopy-ui history manifest (now kept at _demo-notes/build/history/canopy-ui/) for _demo-notes/build/replay_history.py.

Estate construction tooling, not a bank artefact. Walks the finished canopy-ui tree and lays its
files out over a 2021-2026 storyline: scaffold, tokens and theme, components landing ticket by
ticket, release trains, a dependency bump train, a revert, a GIS fix, formatting sweeps, and the
3.5.0 / 3.6.1 / 3.7.0 moments the brief calls out. Files whose content differs at the 3.5.0 and
3.6.1 tags are introduced with the tag's content and rewritten at the later release.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] if False else Path("/home/ubuntu/repos/angular-migration-demo-estate")
C = "canopy-ui/"
LIB = C + "projects/canopy-ui/src/lib/"
SHOW = C + "projects/canopy-showcase/src/app/"
PAGES = SHOW + "pages/components/"


def git(*a):
    return subprocess.run(["git", "-C", str(ROOT), *a], capture_output=True, text=True, check=True).stdout


SOURCE_BRANCH = "feature/CNPY-2140-design-system-build"
FILES = [l for l in git("ls-tree", "-r", "--name-only", SOURCE_BRANCH, "canopy-ui").splitlines() if l]
FILES.append("_demo-notes/build/logs/canopy-ui.md")
FILES.append(C + ".history/manifest.json")
FILES.append(C + ".history/gen_manifest.py")
FILESET = set(FILES)
USED = set()

TAG350 = "canopy-ui/v3.5.0"
TAG361 = "canopy-ui/v3.6.1"
diff350 = set(git("diff", "--name-only", TAG350, SOURCE_BRANCH, "--", "canopy-ui").splitlines())
tree350 = set(git("ls-tree", "-r", "--name-only", TAG350, "canopy-ui").splitlines())
tree361 = set(git("ls-tree", "-r", "--name-only", TAG361, "canopy-ui").splitlines())
diff361 = set(git("diff", "--name-only", TAG361, SOURCE_BRANCH, "--", "canopy-ui").splitlines())
POST350 = [p for p in FILES if p.startswith(C) and p not in tree350 and p in diff350]  # new after 3.5.0


def content_at(tag, path):
    return git("show", "{}:{}".format(tag, path))


def P(*globs):
    """Paths matching any of the given prefixes/exact names, not yet used."""
    out = []
    for g in globs:
        for f in FILES:
            if (f == g or f.startswith(g)) and f not in USED:
                out.append(f)
    for f in out:
        USED.add(f)
    return out


commits = []


def c(date, author, message, paths=None, body=None, empty=False, tag_content=None):
    entry = {"date": date + "T00:00:00" if "T" not in date else date, "author": author, "message": message}
    if body:
        entry["body"] = body
    if empty or not paths:
        entry["empty"] = True
    else:
        entry["paths"] = paths
        if tag_content:
            content = {}
            for p in paths:
                if p in diff350 and p in tree350:
                    content[p] = content_at(tag_content, p)
            if content:
                entry["content"] = content
    commits.append(entry)


def e(date, author, message, body=None):
    c(date, author, message, empty=True, body=body)


def comp(prefix):
    return P(LIB + prefix + "/")


def page(slug):
    return P(PAGES + slug + "-page.component.ts")


F = "l.fontaine"; H = "h.eriksen"; S = "s.whitfield"; W = "w.tanaka"; BOT = "meridian-dependency-bot"
GIS1 = "c.mbeki"; GIS2 = "v.orlova"; RET = "b.arceneaux"; RET2 = "d.okafor"; BIZ = "k.subramani"; KEY = "g.mwangi"
T350 = TAG350  # introduce differing files with their 3.5.0 content

# ---- 2021: 3.0 rebuild on Angular 11/12 Material, 3.0.0 in April, 3.1, 3.2 ---------------------
c("2021-03-01", F, "CNPY-1 scaffold the Canopy 3 workspace on the Angular CLI",
  P(C + "angular.json", C + "tsconfig.json", C + ".gitignore", C + ".editorconfig", C + ".nvmrc",
    C + "projects/canopy-ui/tsconfig.lib.json", C + "projects/canopy-ui/tsconfig.lib.prod.json",
    C + "projects/canopy-ui/tsconfig.spec.json", C + "projects/canopy-ui/karma.conf.js",
    C + "projects/canopy-ui/src/test.ts", C + "projects/canopy-ui/ng-package.json"),
  body="Canopy 2.x stays on the Bootstrap fork for business-web. This is the rebuild on Material agreed in ADR 0001.")
c("2021-03-01", F, "CNPY-1 pin dependencies and commit the lockfile", P(C + "package.json", C + "package-lock.json", C + ".npmrc"), tag_content=T350)
c("2021-03-02", F, "CNPY-3 record the decision to wrap Angular Material", P(C + "docs/adr/0001-wrap-angular-material.md"))
c("2021-03-03", H, "CNPY-7 brand colour tokens as SCSS maps", P(LIB + "tokens/_colors.scss"))
c("2021-03-04", H, "CNPY-7 spacing, radius, elevation and typography tokens",
  P(LIB + "tokens/_spacing.scss", LIB + "tokens/_typography.scss", LIB + "tokens/_elevation.scss", LIB + "tokens/_radius.scss", LIB + "tokens/_index.scss", LIB + "tokens/_motion.scss", LIB + "tokens/_z-index.scss"))
c("2021-03-05", H, "CNPY-7 emit tokens as CSS custom properties on :root", P(LIB + "tokens/_css-vars.scss"), tag_content=T350)
c("2021-03-08", F, "CNPY-9 Material palettes from the brand tokens", P(LIB + "themes/_palettes.scss"), tag_content=T350)
c("2021-03-09", F, "CNPY-9 typography config using the Material level names", P(LIB + "themes/_typography.scss"))
c("2021-03-10", F, "CNPY-9 canopy.theme() mixin: core, light theme, body defaults", P(LIB + "themes/_theme.scss", LIB + "themes/_index.scss"), tag_content=T350)
c("2021-03-11", H, "CNPY-11 component colour overrides split out of the theme file", P(LIB + "themes/_component-overrides.scss"))
c("2021-03-12", F, "CNPY-12 prebuilt theme CSS entry points for consumers without Sass", P(LIB + "themes/prebuilt/"), tag_content=T350)
c("2021-03-15", F, "CNPY-14 core module, CanopyConfig token and root public API",
  P(LIB + "core/canopy-config.ts", LIB + "core/core.module.ts", LIB + "core/public-api.ts", C + "projects/canopy-ui/src/public-api.ts", C + "projects/canopy-ui/core/ng-package.json"), tag_content=T350)
c("2021-03-16", H, "CNPY-15 icon sprite and MatIconRegistry registration",
  P(LIB + "icons/canopy-sprite.svg", LIB + "icons/icon-registry.ts", LIB + "icons/icon.module.ts", LIB + "icons/public-api.ts", C + "projects/canopy-ui/icons/ng-package.json"))
c("2021-03-17", H, "CNPY-15 spec for the icon registry", P(LIB + "icons/icon-registry.spec.ts"))
c("2021-03-18", F, "CNPY-18 cn-button with icon slots and loading state", comp("actions/button"))
c("2021-03-19", F, "CNPY-18 actions entry point", P(LIB + "actions/public-api.ts", C + "projects/canopy-ui/actions/ng-package.json"))
c("2021-03-22", H, "CNPY-19 cn-icon-button", comp("actions/icon-button"))
c("2021-03-23", F, "CNPY-21 cn-card", comp("data-display/card"))
c("2021-03-24", F, "CNPY-21 cn-divider", comp("data-display/divider"))
c("2021-03-25", H, "CNPY-22 cn-badge with count and dot variants", comp("data-display/badge"))
c("2021-03-26", F, "CNPY-23 data-display entry point", P(LIB + "data-display/public-api.ts", C + "projects/canopy-ui/data-display/ng-package.json"), tag_content=T350)
e("2021-03-29", F, "CNPY-24 karma: ChromeHeadless with no-sandbox for the Jenkins agents")
c("2021-03-30", F, "CNPY-26 forms module and entry point", P(LIB + "forms/forms.module.ts", LIB + "forms/public-api.ts", C + "projects/canopy-ui/forms/ng-package.json"))
c("2021-03-31", H, "CNPY-27 cn-checkbox", comp("forms/checkbox"))
c("2021-04-01", H, "CNPY-27 cn-radio-group", comp("forms/radio-group"))
c("2021-04-02", F, "CNPY-28 cn-toggle wrapping mat-slide-toggle", comp("forms/toggle"))
c("2021-04-06", F, "CNPY-30 cn-select with option groups and panel class", comp("forms/select"))
c("2021-04-07", H, "CNPY-31 currency format service", P(LIB + "core/currency-format.service.ts"))
c("2021-04-08", H, "CNPY-32 cn-currency-input as a MatFormFieldControl", comp("forms/currency-input"),
  body="Implements ControlValueAccessor and MatFormFieldControl<number> so it sits inside mat-form-field like a native input. Prefix alignment is against the form field underline.")
c("2021-04-09", F, "CNPY-33 cn-progress: bar and spinner", comp("data-display/progress") or comp("feedback/progress"))
c("2021-04-12", F, "CNPY-34 feedback entry point", P(LIB + "feedback/public-api.ts", C + "projects/canopy-ui/feedback/ng-package.json"), tag_content=T350)
c("2021-04-13", H, "CNPY-35 cn-tooltip", comp("overlays/tooltip"))
c("2021-04-14", H, "CNPY-36 cn-toast on MatSnackBar", comp("overlays/toast"))
c("2021-04-15", F, "CNPY-37 cn-dialog-shell", comp("overlays/dialog-shell"))
c("2021-04-16", F, "CNPY-37 overlays entry point", P(LIB + "overlays/public-api.ts", C + "projects/canopy-ui/overlays/ng-package.json"))
c("2021-04-19", H, "CNPY-38 cn-menu", comp("actions/menu"))
c("2021-04-20", F, "CNPY-40 showcase application scaffold",
  P(C + "projects/canopy-showcase/tsconfig.app.json", C + "projects/canopy-showcase/tsconfig.spec.json", C + "projects/canopy-showcase/karma.conf.js",
    C + "projects/canopy-showcase/.browserslistrc", C + "projects/canopy-showcase/src/main.ts", C + "projects/canopy-showcase/src/polyfills.ts",
    C + "projects/canopy-showcase/src/index.html", C + "projects/canopy-showcase/src/favicon.ico", C + "projects/canopy-showcase/src/test.ts",
    C + "projects/canopy-showcase/src/environments/", C + "projects/canopy-showcase/src/assets/.gitkeep", C + "projects/canopy-showcase/src/styles.scss"))
c("2021-04-20", F, "CNPY-40 showcase app module, routing and shell",
  P(SHOW + "app.module.ts", SHOW + "app-routing.module.ts", SHOW + "app.component.ts", SHOW + "pages/pages.module.ts", SHOW + "shared/shared.module.ts"), tag_content=T350)
c("2021-04-21", H, "CNPY-40 demo page and section wrappers for the showcase", P(SHOW + "shared/demo-page.component.ts", SHOW + "shared/demo-section.component.ts"))
c("2021-04-21", H, "CNPY-41 showcase home and foundations pages", P(SHOW + "pages/home/", SHOW + "pages/foundations/tokens-page.component.ts", SHOW + "pages/foundations/themes-page.component.ts", SHOW + "pages/foundations/icons-page.component.ts"), tag_content=T350)
c("2021-04-21", F, "CNPY-41 showcase pages for the first components", P(PAGES + "component-pages.ts") + page("button") + page("icon-button") + page("card") + page("divider") + page("badge") + page("checkbox") + page("radio-group") + page("toggle") + page("select") + page("currency-input") + page("progress") + page("tooltip") + page("toast") + page("dialog-shell") + page("menu"), tag_content=T350)
c("2021-04-22", F, "CNPY-42 CHANGELOG, package README and publish script for 3.0.0", P(C + "CHANGELOG.md", C + "projects/canopy-ui/README.md", C + "projects/canopy-ui/package.json", C + "scripts/publish.sh"), tag_content=T350)
e("2021-04-22", F, "Merge release/2021.04 into main for train 2021.04.2")
e("2021-04-22", F, "CNPY-42 tag 3.0.0")
c("2021-04-26", S, "CNPY-44 SECURITY.md, CODEOWNERS and data classification", P(C + "SECURITY.md", C + "CODEOWNERS", C + "DATA_CLASSIFICATION.md"))
c("2021-04-27", S, "CNPY-44 pull request template", P(C + ".github/pull_request_template.md"))
c("2021-04-28", F, "CNPY-45 Jenkinsfile on meridianNodePipeline", P(C + "Jenkinsfile"))
c("2021-04-29", F, "CNPY-46 sonar and checkmarx configuration", P(C + "sonar-project.properties", C + "checkmarx.yml"))
e("2021-05-04", H, "CNPY-51 cn-toast: action button colour on the dark snack bar surface")
e("2021-05-05", F, "CNPY-52 cn-select: panel width follows the trigger (retail-web report)")
e("2021-05-06", F, "CNPY-53 3.0.1 changelog")
e("2021-05-06", F, "Merge release/2021.05 into main for train 2021.05.1")
c("2021-05-18", H, "CNPY-57 cn-list", comp("data-display/list"), tag_content=T350)
c("2021-05-19", H, "CNPY-58 cn-expansion", comp("data-display/expansion"))
c("2021-05-25", F, "CNPY-60 cn-tabs with badge slots", comp("navigation/tabs"))
c("2021-05-26", F, "CNPY-60 navigation entry point", P(LIB + "navigation/public-api.ts", C + "projects/canopy-ui/navigation/ng-package.json"))
c("2021-06-02", H, "CNPY-63 layout entry point", P(LIB + "layout/public-api.ts", C + "projects/canopy-ui/layout/ng-package.json"))
c("2021-06-03", H, "CNPY-63 cn-page-header on flex-layout", comp("layout/page-header"))
c("2021-06-08", H, "CNPY-64 cn-page-shell with nav rail and theme toggle", comp("layout/page-shell") + P(LIB + "core/theme.service.ts"), tag_content=T350)
c("2021-06-09", F, "CNPY-65 showcase pages for list, expansion, tabs, page header and shell", page("list") + page("expansion") + page("tabs") + page("page-header") + page("page-shell"))
e("2021-06-15", BOT, "CNPY-0 bump @angular/* to 11.2.14 and @angular/material to 11.2.13")
e("2021-06-16", F, "CNPY-68 lockfile refresh after the bump train")
c("2021-06-22", S, "CNPY-70 CONTRIBUTING: branches, tickets, public API freeze within a major", P(C + "CONTRIBUTING.md"))
e("2021-06-29", H, "CNPY-72 cn-tabs: ink bar width wrong when a label has a badge")
c("2021-07-06", F, "CNPY-75 cn-account-card for retail-web dashboard", comp("data-display/account-card"))
c("2021-07-07", F, "CNPY-75 account card showcase page on the fixtures service", page("account-card") + P(SHOW + "shared/fixtures.service.ts"))
e("2021-07-08", RET, "MOL-2210 account card: masked number needs the last four only, not last six")
e("2021-07-13", H, "CNPY-78 formatting sweep, prettier 2.3 defaults")
c("2021-07-20", F, "CNPY-80 cn-data-table with column defs, sorting and density", comp("data-display/data-table"), tag_content=T350)
c("2021-07-21", F, "CNPY-80 data table showcase on transaction fixtures", page("data-table"))
e("2021-07-27", H, "CNPY-83 data table: sticky header offset under the page header")
e("2021-08-03", F, "CNPY-85 data table: compact density tightens the cell padding")
c("2021-08-10", H, "CNPY-87 cn-filter-chips on mat-chip-list", comp("data-display/filter-chips"))
c("2021-08-11", H, "CNPY-87 filter chips showcase page", page("filter-chips"))
e("2021-08-17", F, "CNPY-89 3.1.0 changelog")
e("2021-08-19", F, "Merge release/2021.08 into main for train 2021.08.2")
e("2021-08-19", F, "CNPY-89 tag 3.1.0")
e("2021-08-24", RET2, "MOL-2388 filter chips: selectionChange emitted twice on keyboard toggle")
e("2021-08-25", H, "CNPY-92 filter chips: revert MOL-2388, broke programmatic selection", body="This reverts commit 7f3c2a1. Deborah's fix removed the change handler the retail-web transaction filter relies on. Will redo behind the selectable input.")
e("2021-08-26", H, "CNPY-92 filter chips: guard the double emit without dropping programmatic writes")
c("2021-09-07", F, "CNPY-95 cn-autocomplete", comp("forms/autocomplete"))
c("2021-09-08", F, "CNPY-95 autocomplete showcase page on payee fixtures", page("autocomplete"))
c("2021-09-14", H, "CNPY-97 cn-masked-input on ngx-mask", comp("forms/masked-input"))
c("2021-09-15", H, "CNPY-97 masked input showcase page", page("masked-input"))
e("2021-09-21", BOT, "CNPY-0 bump ngx-mask to 12.0.0")
e("2021-09-28", F, "CNPY-99 masked input: phone mask drops the area code on paste")
c("2021-10-05", F, "CNPY-101 cn-date-range on MatMomentDateModule", comp("forms/date-range"),
  body="Moment because retail-web already ships it for statements and the date-fns adapter was not in Material 12. Custom MAT_DATE_FORMATS for the bank's MM/DD/YYYY display.")
c("2021-10-06", F, "CNPY-101 date range showcase page", page("date-range"))
e("2021-10-12", H, "CNPY-103 date range: presets for last 30, 60, 90 days")
e("2021-10-19", BOT, "CNPY-0 bump moment to 2.29.1")
e("2021-10-26", F, "CNPY-105 3.2.0 changelog")
e("2021-11-04", F, "Merge release/2021.11 into main for train 2021.11.1")
e("2021-11-04", F, "CNPY-105 tag 3.2.0")
e("2021-11-09", BIZ, "MBZ-1710 select: optgroup label colour in the business-web theme")
e("2021-11-16", H, "CNPY-108 select: memoise option groups so the panel does not re-render")
e("2021-11-30", F, "CNPY-110 README: on-call rota and consumer matrix")
e("2021-12-07", BOT, "CNPY-0 bump @angular/* to 12.2.16")
e("2021-12-14", F, "CNPY-112 lockfile refresh after the 12.2.16 bump")
# ---- 2022: Angular 13 then 14, 3.3, 3.4 -------------------------------------------------------
e("2022-01-11", F, "CNPY-118 Angular 13 upgrade: ng update @angular/core@13 @angular/cli@13")
e("2022-01-11", F, "CNPY-118 Angular Material 13 and CDK 13")
e("2022-01-12", F, "CNPY-118 ng-packagr 13, drop View Engine output")
e("2022-01-13", H, "CNPY-118 fix the typography includes after the 13 theming reshuffle")
e("2022-01-18", F, "CNPY-120 flex-layout 13.0.0-beta.38")
c("2022-01-25", H, "CNPY-122 cn-stepper-shell for onboarding and transfers", comp("navigation/stepper-shell"))
c("2022-01-26", H, "CNPY-122 stepper shell showcase page", page("stepper-shell"))
e("2022-02-01", F, "CNPY-124 3.3.0 changelog")
e("2022-02-03", F, "Merge release/2022.02 into main for train 2022.02.1")
e("2022-02-03", F, "CNPY-124 tag 3.3.0")
e("2022-02-08", KEY, "KEY-1402 stepper: allow linear=false for the keystone MFA enrolment")
e("2022-02-15", H, "CNPY-127 stepper: back button rendered on the first step")
c("2022-02-22", F, "CNPY-129 a11y entry point with cnFocusTrap", P(LIB + "a11y/a11y.module.ts", LIB + "a11y/focus-trap.directive.ts", LIB + "a11y/public-api.ts", C + "projects/canopy-ui/a11y/ng-package.json"))
c("2022-02-23", F, "CNPY-129 focus trap showcase page", page("focus-trap"))
c("2022-03-15", H, "CNPY-1760 cnSkipLink directive", P(LIB + "a11y/skip-link.directive.ts") + page("skip-link"))
e("2022-03-01", GIS1, "GIS-2044 dialog shell: close on escape must also clear the busy state")
e("2022-03-08", F, "CNPY-131 3.3.1 changelog")
e("2022-03-10", F, "Merge release/2022.03 into main for train 2022.03.1")
e("2022-03-10", F, "CNPY-131 tag 3.3.1")
c("2022-03-22", F, "CNPY-134 record the secondary entry point decision", P(C + "docs/adr/0002-secondary-entry-points.md"))
c("2022-03-29", H, "CNPY-136 API report script and committed reports per entry point", P(C + "scripts/api-report.js", C + "docs/api/"), tag_content=T350)
e("2022-04-05", H, "CNPY-136 api:check in the pipeline")
c("2022-04-12", F, "CNPY-138 cn-amount-slider with thumb label and ticks", comp("forms/amount-slider"))
c("2022-04-13", F, "CNPY-138 amount slider showcase page", page("amount-slider"))
e("2022-04-19", H, "CNPY-140 amount slider: displayWith in whole dollars below 1000")
e("2022-05-03", BOT, "CNPY-0 bump @angular/* to 13.3.5")
e("2022-05-10", F, "CNPY-143 lockfile refresh")
e("2022-05-17", RET, "MOL-2801 toast: queue instead of replacing when two arrive in one tick")
e("2022-05-24", H, "CNPY-146 toast: duration input, default from CanopyConfig")
e("2022-06-07", F, "CNPY-150 Angular 14 upgrade: ng update @angular/core@14 @angular/cli@14")
e("2022-06-07", F, "CNPY-150 Angular Material 14.0.0 and CDK 14.0.0")
e("2022-06-08", F, "CNPY-150 TypeScript 4.7 and ng-packagr 14")
e("2022-06-08", H, "CNPY-150 typography: move to mat.define-typography-config with the level names")
e("2022-06-09", F, "CNPY-150 flex-layout 14.0.0-beta.40")
e("2022-06-14", H, "CNPY-152 currency input: touched state through NgControl after the 14 forms change")
e("2022-06-21", F, "CNPY-154 3.4.0 changelog")
e("2022-06-28", F, "Merge release/2022.06 into main for train 2022.06.2")
e("2022-06-28", F, "CNPY-154 tag 3.4.0")
e("2022-06-29", F, "CNPY-1512 3.4.1: package.json version drifted from the tag, publish script now trusts the tag")
e("2022-06-29", F, "CNPY-1512 tag 3.4.1")
e("2022-07-12", BOT, "CNPY-0 bump @angular/* to 14.0.6")
e("2022-07-19", H, "CNPY-158 formatting sweep after the 14 migration")
e("2022-08-02", BOT, "CNPY-0 bump @angular/material to 14.1.1")
e("2022-08-09", F, "CNPY-160 lockfile refresh")
c("2022-08-10", F, "CNPY-1794 cn-bottom-sheet for mobile viewports", comp("overlays/bottom-sheet") + page("bottom-sheet"))
c("2022-08-16", F, "CNPY-162 ng-add schematic that installs the theme and sprite",
  P(C + "projects/canopy-ui/schematics/", C + "scripts/copy-lib-assets.js"))
e("2022-08-23", H, "CNPY-162 schematic: tolerate a missing styles array in angular.json")
e("2022-09-06", GIS2, "GIS-2310 dependency audit: minimist override in the lockfile")
e("2022-09-13", F, "CNPY-165 README: build agent label moved to nodejs16-rhel8")
e("2022-09-20", BOT, "CNPY-0 bump rxjs to 7.5.7")
e("2022-10-04", H, "CNPY-168 data table: empty state slot")
e("2022-10-11", F, "CNPY-170 data table: harness based spec")
e("2022-10-25", BOT, "CNPY-0 bump @angular/* to 14.2.7 and @angular/material to 14.2.7")
e("2022-11-01", F, "CNPY-172 lockfile refresh after 14.2.7")
e("2022-11-08", H, "CNPY-174 select: required asterisk in the label")
c("2022-11-15", H, "CNPY-2003 cn-a11y-announcer on LiveAnnouncer", P(LIB + "a11y/announcer.component.ts") + page("a11y-announcer"))
c("2022-11-22", F, "CNPY-176 showcase: dashboard demo on account, transaction and payee fixtures", P(SHOW + "pages/dashboard/"), tag_content=T350)
e("2022-12-06", BOT, "CNPY-0 bump zone.js to 0.11.8")
e("2022-12-13", F, "CNPY-178 zone.js 0.11.8 lockfile refresh")
# ---- 2023: quiet first half, 3.4.2, 3.5.0 in October ------------------------------------------
e("2023-01-17", H, "CNPY-181 badge: dot variant contrast on green surfaces")
c("2023-01-24", H, "CNPY-2011 cn-skeleton", comp("data-display/skeleton") + page("skeleton"))
e("2023-01-31", F, "CNPY-183 CONTRIBUTING: consumers may not reach into internals", body="business-web has ::ng-deep on .mat-select-panel in three places. Writing it down so the next review can point at something.")
e("2023-02-14", RET2, "MOL-3105 account card: available balance shown for credit accounts")
e("2023-02-28", H, "CNPY-186 account card: revert MOL-3105 pending product decision")
e("2023-03-14", F, "CNPY-188 docs: runbook for publishing a release", )
c("2023-03-14", F, "CNPY-188 publish runbook", P(C + "docs/runbooks/publish-a-release.md"))
e("2023-04-04", BOT, "CNPY-0 bump sass to 1.54.9")
e("2023-04-18", H, "CNPY-190 tooltip: show delay from tokens")
e("2023-05-09", F, "CNPY-192 checkmarx: exclude specs and dist from the scan")
c("2023-05-16", F, "CNPY-1801 cn-disclosure renders content service HTML", comp("content/disclosure") + P(LIB + "content/public-api.ts", C + "projects/canopy-ui/content/ng-package.json") + page("disclosure"),
  body="Copy comes from the bank's own CMS through content-service, authored by Compliance. Rendered as is so their markup survives. Reviewed with GIS (GIS-2790).")
e("2023-05-23", GIS1, "GIS-2790 disclosure: review note and checkmarx suppression by rule")
e("2023-06-13", F, "CNPY-195 3.4.2 changelog")
e("2023-06-15", F, "Merge release/2023.06 into main for train 2023.06.1")
e("2023-06-15", F, "CNPY-195 tag 3.4.2")
e("2023-07-11", H, "CNPY-198 currency input: negative amounts for refunds")
e("2023-07-25", F, "CNPY-200 select: optgroup rendering loop under OnPush")
e("2023-08-08", BIZ, "MBZ-2044 legacy token aliases for business-web global styles", body="Pre-3.0 names, frozen at their 2.x values. Remove when MBZ-2210 lands.")
c("2023-08-08", BIZ, "MBZ-2044 legacy tokens file", P(LIB + "tokens/_legacy-tokens.scss"))
e("2023-08-22", H, "CNPY-203 masked input: forRoot so standalone routes get the mask config")
e("2023-09-05", F, "CNPY-205 tabs: markForCheck after content check for projected badges")
e("2023-09-19", H, "CNPY-207 formatting sweep")
e("2023-10-03", F, "CNPY-1712 3.5.0 changelog and consumer notes")
e("2023-10-17", F, "CNPY-1712 api reports for 3.5.0")
c("2023-10-19", F, "CNPY-1712 Canopy 3.5.0", P(C + "README.md"), tag_content=T350)
e("2023-10-19", F, "Merge release/2023.10 into main for train 2023.10.2")
TAG_350_INDEX = len(commits) - 1
e("2023-10-19", F, "CNPY-1712 tag 3.5.0")
e("2023-10-31", BIZ, "MBZ-2101 business-web pins 3.5.0 exactly; note in README consumer matrix")
e("2023-11-14", BOT, "CNPY-0 bump @types/node to 16.18.11", body="Newer @types/node ships Disposable declarations TypeScript 4.7 cannot parse. Pinned exactly.")
e("2023-11-28", F, "CNPY-1740 dark theme spike behind a class on html")
e("2023-12-05", H, "CNPY-1753 high contrast: focus ring token and forced-colors handling")
# ---- 2024: 3.6, 3.7, 3.7.2 ----------------------------------------------------------------------
e("2024-01-16", H, "CNPY-1760 skip link: visible on focus only, token for the offset")
e("2024-01-23", F, "CNPY-1794 bottom sheet: drag handle and safe-area padding")
e("2024-02-06", F, "CNPY-1801 disclosure: expanded state persisted per disclosure id")
e("2024-02-13", GIS2, "GIS-3317 disclosure: annual review of the CMS trust boundary, no change")
e("2024-02-20", H, "CNPY-1782 tokens: half step spacing values")
e("2024-03-05", F, "CNPY-1820 3.6.0 changelog")
e("2024-03-07", F, "Merge release/2024.03 into main for train 2024.03.1")
e("2024-03-07", F, "CNPY-1820 tag 3.6.0")
e("2024-03-19", KEY, "KEY-2210 keystone-web moves to 3.6.0")
e("2024-04-02", H, "CNPY-1902 toast: action button not reachable by keyboard when a dialog is open")
e("2024-04-09", H, "CNPY-1899 filter chips: selectionChange fired for programmatic writes")
e("2024-04-16", F, "CNPY-1887 stepper shell: back button on the first step, again")
c("2024-04-18", F, "CNPY-1902 Canopy 3.6.1", P(), tag_content=TAG361)
# 3.6.1 content for the files that differ between 3.5.0 and 3.6.1
commits[-1]["paths"] = sorted(p for p in tree361 if p in diff350 and content_at(TAG361, p) != content_at(TAG350, p))
commits[-1]["content"] = {p: content_at(TAG361, p) for p in commits[-1]["paths"]}
commits[-1].pop("empty", None)
e("2024-04-18", F, "Merge release/2024.04 into main for train 2024.04.2")
TAG_361_INDEX = len(commits) - 1
e("2024-04-18", F, "CNPY-1902 tag 3.6.1")
e("2024-05-07", BOT, "CNPY-0 bump ngx-mask to 14.3.3")
e("2024-05-14", F, "CNPY-1950 lockfile refresh")
c("2024-05-21", H, "CNPY-1960 cn-virtual-list on CDK virtual scroll", comp("data-display/virtual-list"))
c("2024-05-22", H, "CNPY-1960 virtual list showcase on transaction history", page("virtual-list"))
e("2024-05-28", H, "CNPY-1960 virtual list: aria-setsize and aria-posinset")
e("2024-06-04", F, "CNPY-1988 data table: compact density also tightens the header row")
c("2024-06-11", F, "CNPY-1994 cn-error-summary with focus on appearance", comp("feedback/error-summary"))
c("2024-06-12", F, "CNPY-1994 error summary showcase and transfer form wiring", page("error-summary"))
e("2024-06-18", H, "CNPY-2003 announcer: politeness input, assertive for transfer failures")
e("2024-06-25", H, "CNPY-2011 skeleton: text variant line count")
c("2024-07-09", F, "CNPY-1810 dark theme: palettes, css vars and the theme mixin",
  [p for p in [LIB + "themes/_theme.scss", LIB + "themes/_palettes.scss", LIB + "tokens/_css-vars.scss", LIB + "themes/prebuilt/canopy-light.scss"]])
c("2024-07-10", F, "CNPY-1810 dark theme: CnThemeService toggle and persistence", [LIB + "core/theme.service.ts", LIB + "core/canopy-config.ts", LIB + "layout/page-shell/theme-toggle.component.ts"])
c("2024-07-11", H, "CNPY-1810 showcase: theme switcher and home copy", [SHOW + "pages/foundations/themes-page.component.ts", SHOW + "pages/home/home-page.component.ts", SHOW + "shared/shared.module.ts"])
c("2024-07-16", F, "CNPY-2020 data display and feedback public API exports for the new components",
  [LIB + "data-display/public-api.ts", LIB + "feedback/public-api.ts", LIB + "data-display/data-table/data-table.component.ts", LIB + "data-display/list/list.component.ts"])
c("2024-07-23", H, "CNPY-2020 showcase: dashboard error summary and component index", [PAGES + "component-pages.ts", PAGES + "currency-input-page.component.ts", SHOW + "pages/dashboard/dashboard-page.component.html"] + P(SHOW + "pages/dashboard/"))
e("2024-07-30", F, "CNPY-2024 deprecate the positional toast signature")
e("2024-08-06", GIS1, "GIS-3402 nginx: CSP frame-ancestors none for the showcase")
c("2024-08-06", GIS1, "GIS-3402 showcase container: Dockerfile, nginx.conf and dockerignore", P(C + "Dockerfile", C + "nginx.conf", C + ".dockerignore"))
c("2024-08-13", F, "CNPY-2030 helm chart for the showcase", P(C + "helm/"))
e("2024-08-20", F, "CNPY-2035 3.7.0 changelog")
e("2024-08-22", F, "Merge release/2024.08 into main for train 2024.08.2")
e("2024-08-22", F, "CNPY-2035 tag 3.7.0")
e("2024-09-03", RET, "MOL-4102 retail-web moves to 3.7.0; account card density input")
e("2024-09-10", H, "CNPY-2041 skeleton: animation off under prefers-reduced-motion")
e("2024-09-17", F, "CNPY-2044 virtual list: keyboard navigation wraps at the ends")
e("2024-10-01", F, "CNPY-2050 3.7.1 changelog")
e("2024-10-03", F, "Merge release/2024.10 into main for train 2024.10.1")
e("2024-10-03", F, "CNPY-2050 tag 3.7.1")
e("2024-10-15", W, "CNPY-2060 record the Material 15 deferral")
c("2024-10-15", W, "CNPY-2060 ADR 0004: defer the Material 15 migration to Canopy 4", P(C + "docs/adr/0004-defer-material-15-migration.md"))
e("2024-10-22", H, "CNPY-2064 error summary: focus the first invalid control after submit")
e("2024-10-29", F, "CNPY-2068 data table: sort arrow colour in high contrast")
c("2024-11-05", H, "CNPY-2070 consumer defect triage runbook", P(C + "docs/runbooks/consumer-defect-triage.md"))
c("2024-11-12", F, "CNPY-2072 3.7.2 changelog, README consumer matrix and api reports", [C + "CHANGELOG.md", C + "README.md", C + "package.json", C + "projects/canopy-ui/package.json"] + [p for p in FILES if p.startswith(C + "docs/api/")])
e("2024-11-14", F, "Merge release/2024.11 into main for train 2024.11.1")
e("2024-11-14", F, "CNPY-2072 tag 3.7.2")
e("2024-11-26", GIS2, "GIS-3480 checkmarx: fail on high")
e("2024-12-10", BOT, "CNPY-0 bump @angular-eslint to 14.4.0")
# ---- 2025-2026: maintenance, lint, dense typography, estate scripts ------------------------------
c("2025-01-21", H, "CNPY-2080 angular-eslint targets and rule sets", P(C + ".eslintrc.json", C + "projects/canopy-ui/.eslintrc.json", C + "projects/canopy-showcase/.eslintrc.json"))
e("2025-01-28", H, "CNPY-2080 lint fixes: unnecessary escapes in the input masks")
e("2025-02-11", F, "CNPY-2085 changelog check script in the pipeline")
c("2025-02-11", F, "CNPY-2085 changelog check", P(C + "scripts/check-changelog.js"))
c("2025-03-04", H, "CNPY-2090 dense typography variant and a styles entry point", P(C + "projects/canopy-ui/src/styles/"))
e("2025-03-18", F, "CNPY-2092 README: known issues, LDG-3104 patched package")
c("2025-04-08", S, "CNPY-2095 gitattributes: pin the two CRLF files rather than renormalise", P(C + ".gitattributes"))
e("2025-05-13", BOT, "CNPY-0 bump @types/node, reverted", body="This reverts the bot bump. TS2304 Disposable again. Pin stays at 16.18.11.")
e("2025-06-10", W, "CNPY-2100 architecture note: 4.0 planning kicked off, no code")
e("2025-09-16", F, "CNPY-2110 Jenkinsfile: coverage gate to 45 while the spec thinning is discussed")
e("2025-11-04", H, "CNPY-2115 showcase: sprite copied to assets/canopy")
e("2026-01-20", F, "CNPY-2120 README: 2026 on-call rota link")
e("2026-03-10", GIS1, "GIS-3610 SECURITY.md: reporting route for Canopy findings")
e("2026-06-16", F, "CNPY-2130 showcase budgets raised for the all-entry-points bundle")
c("2026-08-25", F, "CNPY-2140 publish-local-versions.sh so consumer boxes can seed a registry", P(C + "scripts/publish-local-versions.sh"))
c("2026-08-27", F, "CNPY-2140 publish.sh delegates to the multi version script when not on a tag", [C + "scripts/publish.sh"])
c("2026-09-01", F, "CNPY-2140 record the history manifest and build log for the estate replay",
  P(C + ".history/manifest.json", C + ".history/gen_manifest.py", "_demo-notes/build/logs/canopy-ui.md"))

# ---- sanity ------------------------------------------------------------------------------------
leftover = [f for f in FILES if f not in USED]
if leftover:
    print("UNASSIGNED FILES (adding to a late commit):", *leftover, sep="\n  ", file=sys.stderr)
    commits.insert(len(commits) - 1, {"date": "2026-08-18T00:00:00", "author": F,
                                       "message": "CNPY-2138 tidy up stray workspace files", "paths": leftover})
# every buildable file in the 3.5.0 tree must exist by the 3.5.0 tag commit
seen = set()
for cm in commits[:TAG_350_INDEX + 1]:
    seen.update(cm.get("paths", []))
missing = [p for p in tree350 if p in FILESET and p not in seen and (p.startswith(C + "projects/") or p.startswith(C + "scripts/"))
           and ".eslintrc" not in p and "/styles/" not in p and "check-changelog" not in p]
if missing:
    raise SystemExit("files in the 3.5.0 tree missing at the 3.5.0 tag commit:\n  " + "\n  ".join(missing))
# post-3.5.0 files must not appear before the 3.5.0 tag commit
for i, cm in enumerate(commits[:TAG_350_INDEX + 1]):
    for p in cm.get("paths", []):
        if p in POST350:
            raise SystemExit("post-3.5.0 file {} introduced at commit {} ({})".format(p, i + 1, cm["message"]))
# replay_history writes 'content' into the working tree and later commits stage from it, so a
# file introduced with tag content has to be rewritten with its final text when it is next touched
rewritten = set()
for cm in commits:
    for p in cm.get("paths", []):
        if p in cm.get("content", {}):
            rewritten.add(p)
        elif p in rewritten:
            cm.setdefault("content", {})[p] = content_at(SOURCE_BRANCH, p)
            rewritten.discard(p)
# the last commit touching a file must leave it at its final (working tree) content
last = {}
for i, cm in enumerate(commits):
    for p in cm.get("paths", []):
        last[p] = i
for p, i in last.items():
    if p in commits[i].get("content", {}) and commits[i]["content"][p] != content_at(SOURCE_BRANCH, p):
        raise SystemExit("{} last touched by #{} with tag content; add a later commit with the final file".format(p, i + 1))
# every 'content' entry must be a text file
for cm in commits:
    for p in cm.get("content", {}):
        assert isinstance(cm["content"][p], str)

manifest = {"component": "canopy-ui", "tags": {"canopy-ui/v3.5.0": TAG_350_INDEX + 1, "canopy-ui/v3.6.1": TAG_361_INDEX + 1,
                                               "canopy-ui/v3.7.2": len(commits)},
            "note": "tags map to 1-based commit indexes in this list; retagged after replay by the build session",
            "commits": commits}
out = ROOT / "canopy-ui/.history/manifest.json"
out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(manifest, indent=1) + "\n")
print("{} commits, 3.5.0 at #{}, 3.6.1 at #{}, {} files, {} leftover".format(len(commits), TAG_350_INDEX + 1, TAG_361_INDEX + 1, len(FILES), len(leftover)))
