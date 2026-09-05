# platform-services build log

Session: child of devin-33d87f034cb94e598251e11c57b97948. Scratch branch
`spike/PLAT-0-platform-services-wip` (pushed after every service, kept for reference); final branch
`feature/PLAT-1001-platform-services` replayed from `develop` after the mock-external, lantern-sdk
and platform-tooling merges. The session was suspended twice on usage limits; nothing was lost
because the scratch branch was pushed each time.

## Toolchain used

Ubuntu 22.04. Java 11.0.x and 17.0.x from `openjdk-11-jdk` / `openjdk-17-jdk` (apt), Maven 3.9.9
unpacked to `/opt/apache-maven-3.9.9` (apt only has 3.6.3), Node 18.19.0 via nvm, Python 3.11 with
one virtualenv per Python service under `~/.venvs/`. Docker 27.4.1 on the box but not used for the
verification runs below; the services ran as processes via `scripts/run-local.sh` against the
in-process mock-external stack (`ESTATE_NO_DOCKER=1`).

Spring Boot 2.7.18 (six Java 11 services), Spring Boot 3.1.12 (entitlements-service, Java 17),
NestJS 9.4.3, Express 4.18.2, FastAPI 0.109.x, reportlab 4.0.x, numpy 1.26.x. H2 2.1.214 in
`MODE=Oracle` and `MODE=DB2` for the local profiles. Every version pinned exactly; lockfiles
committed.

## Verification results

- `make build && make test` from `platform-services/`: exit 0. Seven `mvn verify` runs green
  (JaCoCo checks pass at each service's own threshold), four Node services lint + Jest green
  (bff-retail 19 tests, bff-business 5, iris-orchestrator 19, documents-service 5), both Python
  services import.
- `make coverage`: JaCoCo aggregate generated at
  `build/coverage-aggregate/target/site/jacoco-aggregate/`, `COVERAGE.md` regenerated. Per service:
  bff-retail 36.5, bff-business 34.6, beacon 25.4, alerts-preferences 41.3, txn-posting 17.5,
  pii-vault 8.5, audit-trail 16.5, entitlements 59.2, bedrock-adapter 24.5, iris 45.9,
  documents 26.0; statements-api and exposure-calc none. Weighted overall 32.0 percent, Java
  aggregate 28.8 percent.
- `scripts/smoke.sh` against the in-process mocks plus all thirteen services: 22 passed, 0 failed,
  twice in a row (the beacon step continues the customer's sequence so reruns work). Covers the
  Keystone authorization code + PKCE login as a fixture customer, bedrock-adapter ACCT-INQ with the
  021000000 routing number, bff-retail `/api/v1/accounts`, beacon out-of-order ingest 3,1,2
  dispatched 1,2,3, audit append / query / hash chain verify, entitlements 401 then roles with a
  token, documents `latest.pdf` served from statements-api then from the archive, statements-api PDF
  5775 bytes starting `%PDF`.
- `scripts/check-forbidden-strings.sh worktree`: PASS. Pre-commit hooks ran on every scratch commit.
- `docker compose -f docker-compose.services.yml config`: valid. The images were not built or run
  in this session (host-built jars/dist copied in by the Dockerfiles; that path is untested here).

## Substitutions and workarounds

- Maven: `~/.m2/settings.xml` mirrors central to the default repo because the box's outbound path
  needed it once; harmless otherwise. The Makefile falls back to `/opt/apache-maven-3.9.9/bin/mvn`
  when `mvn` is not on PATH (`MVN_BIN` override).
- Oracle 19c is H2 `MODE=Oracle` with `LocalOracleDialect` in the common starter; DB2 is H2
  `MODE=DB2` with `LocalDb2Dialect`. Flyway migrations are written in the target dialect and run
  on H2; two Oracle-isms (`NUMBER(19)` identity, `SYSTIMESTAMP` defaults) needed the dialect
  subclasses. Real datasource blocks are commented out in each `application.yml`.
- Jakarta: entitlements-service (Boot 3, `jakarta.*`) cannot use the Boot 2 common starter's
  servlet filter and exception handler, so it carries its own copies under
  `entitlements-service/src/main/java/.../infra/`. Deliberate duplication, noted in its README as
  PLAT-1900; the starter gets a Boot 3 line when the rest of the estate moves.
- IBM MQ: the developer container was never pulled here. Every MQ-facing service runs the
  `local-artemis` profile; the JMS abstraction is the same and nothing changes in code. Because
  the Bedrock core mock exposes its queues over REST rather than a broker, bedrock-adapter gained an
  HTTP transport (`meridian.bedrock.transport=http`) that speaks the same MTBREQ/MTBRESP records.
  Helm values keep `mq`.
- Kafka: `local-inmem-kafka` profile in alerts-preferences, audit-trail and entitlements is an
  in-process publisher/consumer pair. audit-trail starts and serves with no broker at all.
- Redis: the Node services fall back to an in-process map when Redis is unreachable (logged once).
  Smoke ran that way; Redis 7 was not started.
- Python virtualenvs live outside the repo (`~/.venvs/<service>`) because
  `check-forbidden-strings.sh worktree` scans everything under the checkout and a venv trips it
  on vendored test data. `run.sh` and the Makefile honour `VENVS`.
- BFF token relay: the Java services are OAuth2 resource servers with the same Keystone audience,
  so the BFFs forward the caller's bearer token rather than minting service tokens. Recorded as
  PLAT-1044 in the code; the alternative (token exchange) is noted for when Keystone splits
  audiences.
- Keystone claims: the merged mock uses `sub` as the customer id and adds `meridian_segment`; the
  Node JWT services accept `customer_id`, `cid`, then `sub`. Documents accepts both
  `/documents/v1` and `/api/v1` because the estate smoke uses the latter.
- mock-external's `estate-up.sh` looks for `platform-services/<name>` and a root `run-<name>` make
  target; the layout here is `services/<name>`, so thirteen top-level symlinks and a `run-%` pattern
  target bridge it (PLAT-2706 in the Makefile comment).
- exposure-calc has no Dockerfile, Helm chart, Jenkinsfile or compose entry on purpose (brief: no
  infrastructure). `run-local.sh` starts it from `run.sh`.

## Traps armed

See the final session report; summary: Boot 2.7 / Java 11 with `javax.*` everywhere except
entitlements; Log4j2 HEC appender configured through `log4j2-meridian.xml` in the starter (breaks on
the Boot 3 logging starter swap); `LocalOracleDialect extends Oracle12cDialect` pinned to Hibernate 5 class names (gone in
Hibernate 6 / Boot 3); beacon `SequenceCoordinator` ordering with no tests; txn-posting reversal and idempotency edges with
no tests; pii-vault at 8 percent with a risk acceptance in place of tests; audit-trail Kafka
consumer untested; statements-api with no test framework and a CAB exception (CAB-2021-1188);
exposure-calc with no infrastructure at all; NestJS 9 hand-rolled `CanActivate` JWT guards binding the token into an AsyncLocalStorage
correlation context; Express 4 documents-service mounting the same router under two prefixes.

## Not done

- Container images never built or started here (compose validated only).
- IBM MQ developer image not exercised; Artemis path only.
- The Jenkinsfiles call `meridianJavaPipeline` / `meridianNodePipeline` from platform-tooling as
  section 6.10 describes and were not executed against a Jenkins.
