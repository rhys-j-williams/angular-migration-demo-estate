#!/usr/bin/env python3
"""Generate the standard governance files every Meridian repository carries.

Not a bank artefact. This lives in _demo-notes because it is estate construction tooling: it
writes the SECURITY.md, CODEOWNERS, CONTRIBUTING.md, DATA_CLASSIFICATION.md, editor and git
configuration, pull request template and scanner configuration that section 6 of the brief
requires in every repository, parameterised per component.
"""

from __future__ import annotations

import argparse
import json
import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


@dataclass
class Component:
    slug: str
    title: str
    key: str
    owner: str
    node: str | None
    agent_label: str
    scanner_language: str
    deployable: bool = True
    extra_owners: list[tuple[str, str]] = field(default_factory=list)


COMPONENTS: list[Component] = [
    Component("canopy-ui", "Canopy design system", "CNPY", "@meridian/canopy-design-system",
              "16.20.2", "nodejs16-rhel8", "ts", deployable=False),
    Component("retail-web", "Meridian Online", "MOL", "@meridian/retail-digital",
              "16.20.2", "nodejs16-rhel8", "ts"),
    Component("business-web", "Meridian Business", "MBZ", "@meridian/business-digital",
              "14.21.3", "nodejs14-rhel7", "ts"),
    Component("iris-widget", "Iris assistant widget", "IRIS", "@meridian/retail-digital",
              "16.20.2", "nodejs16-rhel8", "ts"),
    Component("keystone-web", "Keystone identity front end", "KEY", "@meridian/identity-platform",
              "16.20.2", "nodejs16-rhel8", "ts"),
    Component("ledgerline-web", "Ledgerline treasury", "LDG", "@meridian/treasury-digital",
              "18.19.0", "nodejs18-rhel9", "ts"),
    Component("lantern-sdk", "Lantern analytics wrapper", "LNTN",
              "@meridian/digital-analytics-enablement", "14.21.3", "nodejs14-rhel7", "ts",
              deployable=False),
    Component("platform-services", "Platform services", "PLAT", "@meridian/payments-platform",
              "18.19.0", "maven-jdk11-rhel8", "java"),
    Component("mock-external", "External system mocks", "PLAT", "@meridian/platform-engineering",
              "18.19.0", "nodejs18-rhel9", "ts", deployable=False),
    Component("platform-tooling", "Delivery tooling", "TOOL", "@meridian/platform-engineering",
              None, "nodejs18-rhel9", "other", deployable=False),
]

SECURITY_MD = """# Application security standard — {title}

Owner: {owner}. Standard reference: GIS-STD-014 Application Security Requirements for Internet
Facing and Internal Digital Channels, revision 9, effective 1 February 2026.

## Reporting

Suspected vulnerabilities go to the Global Information Security intake queue
(`gis-appsec-intake@meridian.internal`) with the component name `{slug}` and, if the finding came
from a scan, the Checkmarx or Xray report identifier. Do not raise a public issue and do not
attach exploit payloads to a Jira ticket.

## Requirements this component is assessed against

1. **Authentication and session.** All authenticated surfaces obtain tokens from Keystone using
   OpenID Connect authorization code with PKCE. Tokens are never written to `localStorage` or to a
   cookie without `HttpOnly`. Idle timeout warns at 8 minutes and terminates at 10.
2. **Step up.** Money movement above the configured threshold requires an MFA claim no older than
   ten minutes (`mfa_at`). Step up is enforced server side; the front end guard is a convenience,
   not a control.
3. **Transport.** TLS 1.2 minimum. Certificate validation is never disabled, in code or in build
   configuration.
4. **Output encoding.** Angular's default sanitisation must not be bypassed. Any use of
   `bypassSecurityTrust*` requires a documented GIS exception with an expiry date.
5. **Cross site request forgery.** State changing calls carry the `X-MERIDIAN-XSRF` header sourced
   from the `MERIDIAN-XSRF` cookie.
6. **Content Security Policy.** No `unsafe-inline` for scripts. Vendor origins are allow-listed
   individually and reviewed at each release train.
7. **Secrets.** No credentials in source, configuration, fixtures or pipeline definitions. Runtime
   secrets are rendered by the Vault agent into the container environment. Placeholders in this
   estate take the form `CHANGEME-<purpose>`.
8. **Dependencies.** Only the internal registry may be used, see DEPENDENCY_POLICY.md in
   platform-tooling. High severity advisories block the release train.
9. **Logging.** No PII, card numbers, full account numbers or tokens in logs. Account numbers are
   masked to the last four digits. Every log line carries `correlationId`.
10. **Accessibility as a control.** WCAG 2.1 AA is contractual for consumer surfaces. Accessibility
    defects on authentication or money movement paths are treated as production incidents.

## Scanning

Checkmarx (`checkmarx.yml`) and SonarQube (`sonar-project.properties`) run in the Jenkins pipeline
for every pull request. The quality gate fails the build on any high severity finding and on a
coverage drop of more than two points against the branch baseline.
"""

CONTRIBUTING_MD = """# Contributing to {title}

Owning team: {owner}. Ask in `#{chat}` on the internal chat platform before starting anything that
crosses a team boundary.

## Branches

| Branch | Purpose |
|---|---|
| `main` | What is in production. Tagged per release train. |
| `develop` | Integration. Everything merges here first. |
| `release/2026.09` | The current train, cut from `develop` at code freeze. |

Feature branches are `feature/{key}-1234-short-description`. Also permitted: `bugfix/`, `hotfix/`,
`spike/`, `chore/`. The pre-commit hook rejects anything else.

## Commits

`{key}-1234 imperative summary`, 72 characters or fewer, with an optional body explaining why. The
ticket key is mandatory; the commit hook rejects commits without one. Reference the release train
in merge commits, for example `Merge release/2026.08 into main for train 2026.08.2`.

## Release trains

Fortnightly, cut on a Tuesday, deployed the following Thursday evening. Code freeze is 17:00 New
York time on the Monday before the cut. Quarter end freezes apply for the last two weeks of March,
June, September and December; only Sev 1 and Sev 2 hotfixes ship in a freeze, and each needs a
change advisory board reference. The calendar is in `platform-tooling/governance/RELEASE_CALENDAR.md`.

## Pull requests

Two approvals, one of which must come from the owning team. Security sensitive paths listed in
CODEOWNERS additionally require @meridian/gis-appsec. Fill in every field of the pull request
template; the change advisory board reference may be `N/A` outside a freeze, but the rollback plan
may not.

## Standing constraints

- Dependency versions are exact. No caret or tilde ranges. Lockfiles are committed.
- Only the internal registry is used. See DEPENDENCY_POLICY.md in platform-tooling.
- Framework and runtime upgrades are platform-level changes and are planned through the
  architecture forum, not raised opportunistically inside a feature pull request.
"""

CANOPY_CONTRIB_EXTRA = """
## Canopy specific rules

- **The public API of Canopy is frozen within a major version.** Anything exported from an entry
  point's `public-api.ts` is a contract with five consuming applications. Additive changes go in a
  minor; a removal, a rename or a changed input type needs a new major and an entry in the
  migration guide.
- **Consumers may not reach into Canopy internals.** No `::ng-deep` into Canopy or Material class
  names from a consuming application, no importing from deep paths, no patching the published
  package. If a consumer needs something Canopy does not expose, raise a CNPY ticket.
- The API report under `docs/api` is regenerated on every build and committed. A pull request that
  changes it without a version bump will not pass review.
"""

DATA_CLASSIFICATION_MD = """# Data classification — {title}

Classification of everything in this component: **Synthetic — Non Restricted**.

This component contains no customer data, no employee data and no production configuration. All
names, addresses, account numbers, card numbers, transactions, payees and balances are produced by
the seeded generator in `@meridian/domain-fixtures` and are safe to commit, screenshot and share
outside the bank.

Guarantees the fixture generator makes, and the ones this component relies on:

- Card numbers deliberately **fail** the Luhn check, so they cannot be mistaken for, or used as,
  real card numbers.
- Account numbers carry the fictional routing number `021000000`, which is inside the reserved test
  range and is not issued to any institution.
- Customer names are drawn from a generated name list, not from any real directory.
- Balances, transactions and merchant names are deterministic for a given seed, so screenshots in
  documentation stay stable.

If you find anything in this component that looks like real data, treat it as a data incident:
stop, do not push, and page the on-call GIS engineer through the standard incident channel.
"""

PR_TEMPLATE = """## Summary

<!-- What changes and why. One paragraph. -->

## Jira

Key: {key}-
Epic:

## Change advisory board

CAB reference: <!-- CHG number, or N/A outside a freeze window -->
Release train: 2026.09.x

## Risk

Rating: <!-- low | medium | high -->
Blast radius: <!-- which surfaces and which customer journeys -->
Feature flag: <!-- Semaphore flag name, or none -->

## Rollback plan

<!-- Exact steps. "Revert the commit" is only acceptable when nothing has migrated. -->

## Verification

- [ ] Unit tests pass locally and in the pipeline
- [ ] Lint passes
- [ ] Ran against the local mock estate (`mock-external/estate-up.sh`)
- [ ] Accessibility check completed for any changed screen (keyboard path, focus order, announcer)
- [ ] No new high severity Checkmarx or Xray findings
- [ ] Screenshots attached for visual changes

## Reviewers

<!-- CODEOWNERS will request the owning team. Add @meridian/gis-appsec for security sensitive paths. -->
"""

EDITORCONFIG = """# Meridian engineering standard, TOOL-880.
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{java,xml}]
indent_size = 4

[*.py]
indent_size = 4

[*.cpy]
indent_style = space
indent_size = 1
trim_trailing_whitespace = false
insert_final_newline = false
"""

GITATTRIBUTES = """* text=auto eol=lf

*.sh   text eol=lf
*.bat  text eol=crlf
*.cmd  text eol=crlf

*.png  binary
*.jpg  binary
*.ico  binary
*.woff binary
*.woff2 binary

# Copybooks are transferred to the mainframe as fixed width records; do not let git touch them.
*.cpy  -text
"""

SONAR_PROPERTIES = """# Consumed by the mock sonar-scanner in platform-tooling/mock-scanners/bin.
sonar.projectKey=meridian:{slug}
sonar.projectName={title}
sonar.projectVersion=2026.09
sonar.sources={sources}
sonar.tests={tests}
sonar.host.url=https://sonar.meridian.internal
sonar.login=CHANGEME-sonar-token-from-vault
sonar.qualitygate.wait=true
{coverage}
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/target/**,**/*.spec.ts,**/*.mock.ts
"""

CHECKMARX_YML = """# Consumed by the mock cx CLI in platform-tooling/mock-scanners/bin.
project:
  name: meridian-{slug}
  team: /CxServer/Meridian/CSWT
scan:
  preset: Meridian-High-And-Medium
  incremental: false
  language: {language}
  source: .
  exclude:
    - node_modules
    - dist
    - coverage
    - target
    - "**/*.spec.ts"
thresholds:
  high: 0
  medium: 5
report:
  formats: [json, html]
  output: .cx-reports
"""

GITIGNORE_TS = """node_modules/
dist/
tmp/
out-tsc/
coverage/
.angular/
.nx/
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
.env
.env.*
!.env.example
.cx-reports/
.scannerwork/
"""

GITIGNORE_MIXED = GITIGNORE_TS + """target/
.mvn/wrapper/maven-wrapper.jar
__pycache__/
*.pyc
.venv/
.pytest_cache/
"""

CHAT = {
    "canopy-ui": "canopy-design-system",
    "retail-web": "retail-digital",
    "business-web": "business-digital",
    "iris-widget": "retail-digital",
    "keystone-web": "identity-platform",
    "ledgerline-web": "treasury-digital",
    "lantern-sdk": "digital-analytics",
    "platform-services": "payments-platform",
    "mock-external": "platform-engineering",
    "platform-tooling": "platform-engineering",
}

SECURITY_PATHS = """
# Security sensitive paths. GIS-STD-014 requires an application security reviewer on all of these.
/Dockerfile                      {owner} @meridian/gis-appsec
/Jenkinsfile                     {owner} @meridian/gis-appsec
/checkmarx.yml                   {owner} @meridian/gis-appsec
/SECURITY.md                     @meridian/gis-appsec
/.npmrc                          {owner} @meridian/gis-appsec
"""


def codeowners(component: Component) -> str:
    lines = [
        "# CODEOWNERS for {}. Reviews are requested automatically.".format(component.title),
        "# Teams are defined in the CSWT organisation; membership changes go through the",
        "# access request process, not through this file.",
        "",
        "*                                {}".format(component.owner),
        "",
    ]
    for path, owner in component.extra_owners:
        lines.append("{:32} {}".format(path, owner))
    lines.append(SECURITY_PATHS.format(owner=component.owner).strip())
    lines.append("")
    lines.append("/docs/adr/                       @meridian/cswt-architecture")
    lines.append("")
    return "\n".join(lines)


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def sources_for(component: Component) -> tuple[str, str, str]:
    if component.slug == "platform-services":
        return ("services,libs", "services", "sonar.coverage.jacoco.xmlReportPaths=**/target/site/jacoco/jacoco.xml")
    if component.slug == "platform-tooling":
        return (".", "", "")
    if component.scanner_language == "ts":
        return ("src,projects", "src,projects",
                "sonar.javascript.lcov.reportPaths=coverage/lcov.info")
    return ("src", "src", "")


def generate(component: Component, force: bool) -> list[str]:
    base = ROOT / component.slug
    written: list[str] = []
    sources, tests, coverage = sources_for(component)
    contributing = CONTRIBUTING_MD.format(
        title=component.title, owner=component.owner, key=component.key,
        chat=CHAT[component.slug])
    if component.slug == "canopy-ui":
        contributing += CANOPY_CONTRIB_EXTRA

    files = {
        "SECURITY.md": SECURITY_MD.format(title=component.title, owner=component.owner,
                                          slug=component.slug),
        "CONTRIBUTING.md": contributing,
        "DATA_CLASSIFICATION.md": DATA_CLASSIFICATION_MD.format(title=component.title),
        "CODEOWNERS": codeowners(component),
        ".github/pull_request_template.md": PR_TEMPLATE.format(key=component.key),
        ".editorconfig": EDITORCONFIG,
        ".gitattributes": GITATTRIBUTES,
        "sonar-project.properties": SONAR_PROPERTIES.format(
            slug=component.slug, title=component.title, sources=sources, tests=tests,
            coverage=coverage),
        "checkmarx.yml": CHECKMARX_YML.format(
            slug=component.slug,
            language={"ts": "typescript", "java": "java", "other": "groovy"}[
                component.scanner_language]),
    }
    if component.slug not in ("platform-tooling",):
        files[".gitignore"] = (GITIGNORE_MIXED if component.slug == "platform-services"
                               else GITIGNORE_TS)
    if component.node:
        files[".nvmrc"] = component.node + "\n"

    for rel, content in files.items():
        target = base / rel
        if target.exists() and not force:
            continue
        write(target, content)
        written.append(str(target.relative_to(ROOT)))
    return written


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("components", nargs="*", default=[])
    parser.add_argument("--force", action="store_true",
                        help="overwrite files that already exist")
    args = parser.parse_args()

    selected = [c for c in COMPONENTS
                if not args.components or c.slug in args.components]
    report = {}
    for component in selected:
        report[component.slug] = generate(component, args.force)
    print(json.dumps({k: len(v) for k, v in report.items()}, indent=2))


if __name__ == "__main__":
    main()
