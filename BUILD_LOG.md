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
