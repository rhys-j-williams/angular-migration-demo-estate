# platform-tooling build log

Session: child of devin-33d87f034cb94e598251e11c57b97948. Branch `feature/TOOL-1395-delivery-tooling`
(160 replayed commits from `develop`, 2020-11 to 2024-12). Scratch state also pushed as
`wip/platform-tooling` as a safety net; delete after integration.

## Toolchain used

Ubuntu 22.04, Java 17, Groovy 4.0.21 (/opt/groovy), JUnit 4.13.2 for the specs, Helm 3.14.4,
Terraform (system, /usr/local/bin), ShellCheck, Ansible via pip, Node 20 for the mock scanners.

## Verification results

- `jenkins-shared-library/run-tests.sh`: groovyc on src/ test/ vars/ (vars syntax-only, Jenkins
  steps resolve at runtime); JUnit `OK (25 tests)`.
- `mock-scanners/run-tests.sh`: all checks passed (findings, suppressions, coverage import, gate,
  Maven and npm, determinism with SOURCE_DATE_EPOCH, exit codes).
- `cx scan` against `canopy-ui/` and `platform-services/`: exit 0, zero findings, JSON+HTML written.
  `sonar-scanner` against `platform-services/`: exit 0, gate OK. `xray audit` against
  `platform-services/libs/ts/domain-fixtures`: 1 High lifecycle finding (engines.node `>=14`),
  1 Medium; exit 1 as designed. `canopy-ui/` had no package.json in this checkout so xray was
  exercised on domain-fixtures and the fixtures instead.
- `helm lint --strict` and `helm template` for 19 charts x dev/uat/prod: all pass.
- `ansible-playbook --syntax-check ansible/build-agent.yml`: pass.
- `terraform validate` on `modules/notifications-lambda` and `envs/sandbox` (init -backend=false): pass.
- `shellcheck` on every .sh: clean. `scripts/check-forbidden-strings.sh worktree`: PASS.

## Substitutions and workarounds

- Groovy specs use plain JUnit 4 rather than Spock, to avoid pulling Spock through the internet
  during the build. Spec files are still named `*Spec.groovy`.
- Vault agent / Helm annotation templates: the chart generator had to escape Go template braces
  twice; rendered output verified by `helm template`.
- `roles/build_agent_common/files/meridian-root-ca.pem.placeholder` uses a `.placeholder` suffix
  because the root `.gitignore` ignores `*.pem`. Defaults reference that filename.
- Dynamic `. "$f"` of Vault env files in the container entrypoints carries `# shellcheck disable=SC1090`.
- `hashicorp/archive` 2.4.1 added to `versions.tf` (needed for `archive_file`), AWS provider 5.31.0.
- The replay script does not stage a directory's dotfiles when given sub-paths; `mock-scanners/.gitignore`
  was committed afterwards with the same author env the script uses.
- Direct `git commit` with author env vars on the CLI came out as the real git user (the proxy or
  hook rewrites it); committing through a subprocess env as the replay script does works.

## Traps

- T34 (from business-web): `nodejs14-rhel7` is out of support; README "Agent labels", the ansible
  inventory group `nodejs14_rhel7`, `group_vars/nodejs14_rhel7.yml` (expired GIS-EX-2023-118) and
  history commits TOOL-690 / TOOL-1393 all point at MBZ-2231 as the blocker. Not fixed.
- Supporting texture for the scanner findings the demo shows: `cx` rules for `bypassSecurityTrust*`
  (T16), `innerHTML`, secrets, `strict-ssl=false`, eval, disabled TLS; `xray` `MERIDIAN-EOL-*`
  lifecycle findings on Node 14 / Angular 14.

## Not done

- Nothing from the brief omitted. `RELEASE_CALENDAR.md` covers 2026 only, as asked.
