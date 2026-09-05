# Build log

Running record of substitutions, workarounds, uncertainties and decisions taken while assembling
the estate. Newest entries at the bottom of each phase.

## Phase 0 — environment, 5 September 2026

Workstation: Ubuntu 22.04, 2 vCPU, 7 GB RAM, 122 GB disk.

| Tool | Required | Installed | Note |
|---|---|---|---|
| Node | 14.21.3, 16.20.2, 18.19.0 | all three via nvm 0.40.1 | `.nvmrc` per directory selects |
| Java | 11 and 17 | OpenJDK 11.0.28 and 17.0.13 | apt |
| Maven | 3.9 | 3.9.9 in `/opt/apache-maven-3.9.9` | apt ships 3.6.3, superseded by a manual install |
| Python | 3.11 | 3.11.15 via deadsnakes | system Python is 3.10 |
| Docker | needed for compose | 27.4.1 present | compose path is available; in process fallbacks still required |
| Chrome | for Karma | Chrome 133 at `~/.local/bin/google-chrome` | `CHROME_BIN` is set in each `karma.conf.js` |

Toolchain proofs, all from a clean CLI workspace:

- Angular 14.2.13 workspace under Node 16.20.2 — production build passes, `ng test` with
  ChromeHeadless passes 3 of 3.
- Angular 12.2.18 library workspace under Node 14.21.3 — `ng build` of a library passes.
- Angular 15.2.11 workspace under Node 16.20.2 — production build passes.
- Angular 16.2.16 workspace under Node 18.19.0 — production build passes.

Substitutions and workarounds:

- **`@types/node` pinned to 16.18.11 in the Angular 12, 14 and 15 workspaces.** The floating
  `@types/node` that npm resolves today ships `Disposable` and `Symbol.dispose` declarations that
  TypeScript 4.3, 4.7 and 4.9 cannot parse, so a production build fails in `node_modules` before it
  reaches application code. Pinning inside the same major that a 2022 estate would have used is
  the minimal fix and is consistent with the exact-version rule.
- Angular CLI 12 is installed globally inside the Node 14 nvm environment rather than run through
  `npx`, because npm 6's `npx` does not resolve the binary from a scoped package reliably.

Decisions taken without asking:

- The estate is assembled as one repository with a directory per component, at Rhys's instruction,
  rather than the ten separate repositories in the brief. Consequence: histories share one commit
  graph. Synthetic authorship, dates, ticket keys and the named stale branches are preserved; tags
  are namespaced by component, for example `canopy-ui/v3.7.2` and `retail-web/v2026.08.1`.
- Pushes go through a token header helper rather than the usual git path, because the Devin GitHub
  App is not installed on this repository and the proxy returns 403. Flagged to Rhys; the token is
  never written into `.git/config`.

## Phase 1 — shared foundations, 5 September 2026

- `platform-services/libs/ts/domain-fixtures` (`@meridian/domain-fixtures` 1.6.0): deterministic
  seeded generation of customers, accounts, cards, transactions, payees, alert preferences and
  entitlements, plus the Bedrock fixed-width codec. 18 tests pass; `tsc --noEmit` is clean.
- Data-safety invariants are enforced by the package and covered by tests: every card number fails
  Luhn, every account and payee carries routing number `021000000`, every email is `@example.com`,
  regulatory alerts cannot be disabled, amounts are integer minor units.
- `platform-services/copybooks`: `MTBACCT`, `MTBTRAN` and `MTBCUST` with a README documenting the
  signed zoned decimal overpunch encoding.
- `_demo-notes/build/authors.json` and `replay_history.py`: the fictional engineer roster across
  five sites with time-zone-correct commit stamps, and the manifest-driven history replay tool.

Corrections made during the phase:

- `MTBACCT` was documented as 128 positions; the fields as specified total **136**. The codec, the
  decoder's validation, the tests and the copybook README were corrected to 136 rather than
  trimming a field to fit the wrong number.

## Phase 10 (partial) — handover deliverables, 5 September 2026

Written ahead of the components they describe, so that each component session has the trap
signatures and conventions to build against:

- `_demo-notes/TRAPS.md` — all 48 traps with paths, grep signatures and expected agent behaviour.
- `_demo-notes/PLAYBOOKS.md`, `KNOWLEDGE.md`, `ASK-DEVIN-PROMPTS.md`,
  `MIGRATION-REPORT-TEMPLATE.md`, `README.md`.
- `scripts/verify-traps.sh` and `scripts/verify-estate.sh`. Both report components that have not
  been built yet as PENDING or SKIP rather than failing, so they are useful during construction.

`_demo-notes/expected-ng-update-15-output.md` is still outstanding: it has to be captured from a
real `ng update` dry run against `canopy-ui` and `retail-web`, which do not exist yet.

## Phase 2, 3, 8, 9 and 10 (tooling) — delegated, 5 September 2026

Four parallel sessions are building `canopy-ui`, `mock-external` plus `lantern-sdk`,
`platform-services` and `platform-tooling` on their own branches. Each owns exactly one top-level
directory and pushes without merging; this session integrates. The five Angular consumers follow
once Canopy publishes, because they cannot install the library until it exists.

## Phase 2 integration and Phase 4 to 7 start, 5 September 2026

`canopy-ui` is on `develop`: 34 components, the `cnFocusTrap` and `cnSkipLink` directives, three
themes, an `ng-add` schematic and traps T1 to T17, over 258 replayed commits. Tags
`canopy-ui/v3.5.0`, `canopy-ui/v3.6.1` and `canopy-ui/v3.7.2` are pushed, and
`canopy-ui/scripts/publish-local-versions.sh` rebuilds and republishes all three into a wiped
Verdaccio, which is what gives the consumers their version fan-out (T47).

`_demo-notes/expected-ng-update-15-output.md` holds the real Angular 15 update output for
`canopy-ui`. Angular CLI 14 has no `ng update --dry-run`, so the Canopy session ran the update for
real inside a throwaway `git worktree` of the same commit and deleted it afterwards. Two findings
worth knowing before the demo: the core and CLI update fails on an `@angular-eslint/schematics`
peer conflict until it is rerun with `--force`, and the migration needs `@meridian/domain-fixtures`
present in Verdaccio or it aborts with a 404.

Per-component history tooling moved out of `canopy-ui/.history/` to
`_demo-notes/build/history/<component>/`, and `.history/` is now ignored. A hidden build directory
inside a bank's design system reads as an accident to anyone indexing the estate.

`scripts/verify-estate.sh` no longer fails the exact-version rule on publishable library manifests.
A library states its peers as ranges on purpose, and Canopy's `^14.0.0` Angular peer range is
trap T37; the check still applies to every workspace we actually install.

Phases 4 to 7 are running in four parallel sessions (`retail-web`, `business-web`, `keystone-web`
with `iris-widget`, `ledgerline-web`), each installing Canopy from local Verdaccio at its own
pinned version. `platform-services` is still building; `iris-orchestrator`, `documents-service`,
`statements-api` and `exposure-calc` are outstanding there, which is also why four checks in
`mock-external/smoke.sh` still skip.
