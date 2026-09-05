# mock-external build log

Session: child of devin-33d87f034cb94e598251e11c57b97948 (same session also built `lantern-sdk`,
separate log). Branch `feature/PLAT-2244-mock-external-estate`, replayed from `develop` after the
platform-tooling merge. Scratch branch `wip/mock-external` was not pushed.

## Toolchain used

Ubuntu 22.04, Node 18.19.0 via nvm (mocks, orchestration, Verdaccio in-process fallback),
TypeScript 5.3.3, Jest 29.7.0 / ts-jest 29.1.2, ESLint 8.56.0, Express 4.18.2, jose 4.15.4
(Keystone keys and JWT), stompit 1.0.0 (Bedrock STOMP transport to Artemis), ldapjs 3.0.7.
Docker 26 with compose v2 on the box; Verdaccio image 5.29.2, Redpanda v23.3.5, Redis 7.2.4,
Artemis 2.31.2. Node 14.21.3 is only needed because `scripts/publish-internal.sh` builds and
publishes `lantern-sdk` when that directory is present.

## Verification results

- `npm run lint` (eslint over every `*/src` and `lib/*/src`): clean.
- `npm run build` (tsc per workspace): clean.
- `npm test` (jest, runInBand): 3 suites, 18 tests, all pass. Covers Keystone authorization code +
  PKCE + MFA + JWKS signature validation (`keystone-idp-mock/src/pkce-flow.spec.ts`), Bedrock
  fixed-width encode/decode including zoned-decimal overpunch (`messages.spec.ts`) and a full
  REQ/RESP round trip through the in-process transport (`roundtrip.spec.ts`).
- `estate-up.sh` with Docker: Verdaccio, 11 mocks, Redpanda, Redis and Artemis all healthy in
  compose; `@meridian/domain-fixtures` and `@meridian/lantern-sdk` published to Verdaccio; port
  table printed. `ESTATE_NO_DOCKER=1`: same table with in-process mocks and the infra rows marked
  skipped with the Spring profile to use.
- `smoke.sh` after both paths: 16 passed, 0 failed, 4 skipped. The skips are the four checks that
  need `platform-services/bff-retail`, `beacon-notifications` and `documents-service`, which are on
  another branch in this checkout; each skip names the missing directory. Exit 1 confirmed by
  running it with the estate down.
- `estate-down.sh` after each run: no listeners left on 4400, 4600-4609, 4873, 14609.
- `scripts/check-forbidden-strings.sh worktree`: PASS. Pre-commit hooks ran on the scratch commits.
- Docker path with a deliberately stale in-process `lantern-collector-mock` on 4607: estate-up
  reports it, stops it, compose binds the port (PLAT-2705 fix).

## Substitutions and workarounds

- Redpanda stands in for Kafka in compose; without Docker the Java services are expected to use
  the `local-inmem-kafka` profile. Documented in `mock-external/README.md` and
  `infra/redpanda/README.md`.
- IBM MQ developer image is behind the `ibm-mq` compose profile (icr.io pull is not guaranteed);
  default is Artemis 2.31.2 with the queues pre-created via `EXTRA_ARGS`. Java side uses profile
  `local-artemis`. Bedrock mock keeps its queues in process and mirrors them onto Artemis over STOMP (61613)
  when `BEDROCK_STOMP_HOST` is set, which compose does.
- Redis: compose only. In-process path documents the in-memory map fallback for the services.
- Oracle and DB2 are H2 in compatibility mode; README carries the real datasource blocks commented
  out. No database containers.
- Verdaccio: the image copies `config.yaml` in and rewrites storage to `/verdaccio/storage`,
  because the bind-mounted config resolved `./storage` under `/verdaccio/conf` and publishes
  failed with EACCES. Publisher `meridian-publisher`, password is a `CHANGEME` placeholder in the
  htpasswd. In-process fallback is `npx verdaccio@5.29.2` under Node 18.
- Splunk HEC and Bedrock Dockerfiles pre-create and chown their data directories before switching
  to `USER node`; a root-owned bind mount produced HTTP 500 on the first HEC post.
- Keystone listens without an explicit host so `localhost` resolves the same way for curl (IPv6
  first on this box) and the browser.
- `verdaccio-up.sh` starts the in-process registry under `setsid` with all three fds redirected;
  before that `estate-up.sh | tee` never returned because the wrapper held the caller's stdout
  (PLAT-2711).
- `smoke.sh` retries the Keystone authorize request up to three times; the retry was added for
  PLAT-2702 but turned out to be unrelated to it (see the post-merge note at the bottom).
- Splunk HEC concatenated-JSON bodies needed a raw text body parser on `/services/collector`;
  `createMockApp` has a `rawTextPaths` option for that.

## Traps

- T39 supporting side: `lantern-collector-mock` serves the mock vendor script `lantern.min.js`
  (`window.Lantern` with `track`, `page`, `identify` and a queue) and `scripts/publish-internal.sh`
  publishes the View Engine `@meridian/lantern-sdk@2.4.1` tarball to Verdaccio for the consuming
  apps. The trap itself lives in `lantern-sdk/`.
- Fixed-width Bedrock messages are parsed per `platform-services/copybooks/`; two CICS abend paths
  (`ASRA` malformed zoned decimal, `AEY9` unsupported function) are there for the adapter's error
  handling tests.

## Known issues (also in mock-external/README.md)

- PLAT-2702 resolved post-merge, see below. Not a Keystone issue.
- Artemis and IBM MQ differ on queue naming for the address/queue split; the Bedrock adapter must
  not depend on `BEDROCK.RESP` being an anycast queue with the same name as its address.
- Bedrock end-of-day batch report is regenerated on each run; nothing persists across restarts.
- `ldap-mock` is plain LDAP on 4609 with no StartTLS; health is HTTP on 14609.

## Not done

- Nothing from the brief omitted. The four platform-services smoke checks were exercised only for
  their skip path, since those directories are not in this checkout.

## Post-merge check (2026-09-05, develop at 246bd33)

Re-ran `estate-up.sh` / `smoke.sh` / `estate-down.sh` against the merged tree (mock-external,
lantern-sdk, platform-tooling all on develop). Docker mode: up clean, smoke 16 passed / 0 failed /
4 skipped, down clean. `ESTATE_NO_DOCKER=1`: up clean, smoke 15 / 1 / 4 on the first run, the one
failure being PLAT-2702, which finally reproduced with the diagnostic line intact:

```
node: bad option: -CvSkdMxBjM7YyhawSbEmWTQ408W0trpSWScn48YIWw
FAIL keystone authorize -- login page did not carry a txn field after 3 attempts (HTTP 400): ... PKCE required
```

Root cause: `smoke.sh` derived the S256 challenge with `node -e '...' "$VERIFIER"`. The verifier is
32 random bytes as base64url, so one time in 64 its first character is `-` and node parses the
argument as a CLI option and exits before running the script. `CHALLENGE` was then empty, the
authorize request had `code_challenge=` with `code_challenge_method=S256`, and Keystone did what it
should: HTTP 400 `PKCE required`, no login page, no `txn`. The three retries reused the same
verifier so they could never help. Everything previously written about cold starts, JWKS
generation races and a one-in-five rate was noise from a small sample; Keystone was never at fault.

Fix (`feature/PLAT-2702-smoke-pkce-verifier-argv` off develop): the verifier is passed through `PKCE_VERIFIER` in the
environment, the script fails fast with `keystone pkce` if the challenge is empty, README known
issue rewritten. After the fix, no-Docker smoke re-run: 16 / 0 / 4, plus a forced verifier starting
with `-` produces a challenge instead of a node error. Keystone's own `pkce-flow.spec.ts` was never
affected because it builds the challenge in-process.
