# Knowledge to load into Devin

Standing instructions for the Meridian estate, drawn from the `CONTRIBUTING.md`, `SECURITY.md` and
`DEPENDENCY_POLICY.md` files that already exist in the repositories. Load these as Devin Knowledge
notes before the demonstration, one note per section, scoped as indicated.

They are written in the bank's voice on purpose. Devin repeating them back during the demo is a
large part of what makes the estate feel real.

---

## Note 1 — Estate topology

**Scope:** all Meridian repositories

Meridian's digital estate is a shared Angular component library and five consuming applications,
plus twelve backend services and their mocks.

`@meridian/canopy-ui` ("Canopy") is the design system. It wraps Angular Material with the bank's
tokens, theming, accessibility behaviours and custom components. It is consumed by `retail-web`
(Meridian Online, consumer banking) at 3.7.2, `business-web` (Meridian Business, small business) at
3.5.0 pinned exactly, `keystone-web` (login, MFA, device trust for the whole bank) at 3.6.1,
`ledgerline-web` (corporate treasury) at 3.7.2 with local patches, and `iris-widget` (the virtual
assistant, shipped as a web component) at 3.7.2.

Consequence: **the library moves first and the consumers follow.** Any change to Canopy is a
five-way fan-out. Never plan a Canopy change without naming the consumers it lands on, and never
estimate one as if it were a single-repository change.

`business-web` is two minor versions behind. It needs a two-hop and it is the least loved
application in the estate, so budget accordingly.

---

## Note 2 — Canopy public API contract

**Scope:** `canopy-ui`, and any repository that imports from it

The public API of Canopy is **frozen within a major version**. Anything exported from an entry
point's `public-api.ts` is a contract with five applications.

- Additive changes are a minor. Anything that removes, renames or narrows is a major.
- Consumers may not reach into Canopy's internals: no `::ng-deep` into Canopy component styles, no
  importing from deep paths, no relying on the Material classes Canopy happens to render.
- Two consumers currently break this rule — `business-web` with `::ng-deep` overrides and
  `ledgerline-web` with a `canopy-compat` reimplementation. Both are known debt with tickets. Do not
  treat them as precedent.
- An Angular Material MDC migration inside Canopy is a **major version**, because it changes the
  rendered DOM that consumers have styled against, whether or not the TypeScript API moves.

The committed API reports under `canopy-ui/docs/api` exist so a reviewer can see the diff. Update
them in the same commit as the API change.

---

## Note 3 — Upgrades and migrations

**Scope:** all Angular repositories

- **One Angular major at a time.** Never skip a major, even when the schematics appear to allow it.
- **The library goes first**, is published, and only then do consumers move.
- Prerequisite work gets its own pull request: RxJS 6 to 7 in `business-web`, TSLint to
  angular-eslint, the Node floor and the matching Jenkins agent label. Do not fold a prerequisite
  into the framework bump; the reviewer cannot separate the two.
- Do not modernise while migrating. Typed forms, `strict`, standalone components, the application
  builder, signals: all worth doing, none of them part of an upgrade pull request. Record them as
  deferred items with a suggested ticket.
- Never delete, skip or weaken a test to reach green, and never lower a coverage threshold. Coverage
  in this estate is low and honest; a number that improves suspiciously during an upgrade will be
  questioned.
- A style override that stops matching is a visual regression, not a dead line. Retarget it and flag
  it for visual review.
- Some dependencies are outside the app team's control. `@meridian/lantern-sdk` is published by the
  Digital Analytics Enablement team on a twice-yearly cadence and is built View Engine; the Jenkins
  agent images belong to Platform Engineering; the Bedrock copybooks belong to Core Banking
  Services. When one of these blocks an upgrade, say so and name the owning team — do not work
  around it locally.

---

## Note 4 — Security standard

**Scope:** all Meridian repositories

Global Information Security (`@meridian/gis-appsec`) reviews every change to authentication,
session handling, interceptors, sanitisation, content security policy, disclosure rendering,
Dockerfiles and Jenkinsfiles. CODEOWNERS enforces this; do not route around it.

- Authentication is OIDC authorization code with PKCE against Keystone. Applications never handle
  passwords and never mint tokens.
- Step-up MFA is required for money movement above the configured threshold, evidenced by an
  `mfa_at` claim no older than ten minutes. Never relax a step-up threshold to make a flow work.
- All sanitisation bypasses (`bypassSecurityTrustHtml` and family) are review items. `cn-disclosure`
  contains one, knowingly, because regulatory disclosure markup comes from the bank's content
  management system. Flag it every time; do not silently remove it, because the disclosures must
  render.
- XSRF protection uses the `MERIDIAN-XSRF` cookie and the `X-MERIDIAN-XSRF` header. Any change to
  the XSRF configuration during a framework migration is a security-relevant change.
- Secrets come from Vault at deploy time. Never commit a credential, a token, a private key or a
  keystore, and never add one to a test fixture.
- Customer data never appears in logs. PII is tokenised through `pii-vault-service`. Log the
  correlation id, not the customer.
- Only the internal registry may be used. Adding a dependency from a public registry, or setting
  `strict-ssl=false` to make an install work, is a policy breach, not a workaround.

---

## Note 5 — Data classification and test data

**Scope:** all Meridian repositories

All data in the development estate is synthetic and generated by `@meridian/domain-fixtures`. Use
it. Do not hand-write customer, account or card data, and never copy anything from a production
extract, a support ticket or a screenshot.

The fixtures package guarantees, and tests, that every generated card number fails the Luhn check,
every account and payee carries the reserved test routing number `021000000`, and every email
address is `@example.com`. Those guarantees are what make this data safe to commit and to put on a
screen in front of an audience.

---

## Note 6 — Ways of working

**Scope:** all Meridian repositories

- Branches: `feature|bugfix|hotfix|spike|chore/<KEY>-<number>-<short-description>`. `develop` is
  the integration branch, `main` is what is released, `release/<train>` is the current train.
- Every commit message begins with a Jira key: `MOL` Meridian Online, `MBZ` Meridian Business,
  `CNPY` Canopy, `KEY` Keystone, `LDG` Ledgerline, `IRIS` Iris, `LNTN` Lantern, `PLAT` platform
  services, `GIS` security findings, `TOOL` platform tooling.
- Pull requests need the Jira key, a CAB reference for anything production-bound, a risk rating, a
  rollback plan and an accessibility check result. The template is in every repository.
- Releases run on a fortnightly train, with a freeze at each quarter end. The calendar is
  `platform-tooling/governance/RELEASE_CALENDAR.md`. Work that misses a train waits.
- Dependency versions are exact. No caret ranges, no `latest`. Lockfiles are committed.
- `legacy-peer-deps` belongs in a repository's `.npmrc`, with a comment saying why, never on a
  command line where nobody can see it.
- Generated or AI-assisted code follows
  `platform-tooling/governance/AI_ASSISTED_CODE_POLICY.md`: it is labelled, a named human reviews
  it, and that human is accountable for it.
