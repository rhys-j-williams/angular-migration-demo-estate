# Ask Devin — the presenter's script

The exact questions to ask, in order, and what a good answer contains. Trap ids in brackets are the
things to listen for; they map to `_demo-notes/TRAPS.md`.

Index `canopy-ui` first, then `retail-web`, then `business-web`, then the rest. The first two carry
the story.

---

## Act one — discovery

### 1. "What is this estate and how does it fit together?"

*Ask against the whole estate once every repository is indexed.*

A good answer names Canopy as the shared design system and lists its five consumers with their
pinned versions, notes that the applications sit on four different Angular majors (14, 14, 15, 16)
and three Node versions, and identifies `retail-web` as the largest surface. It should reach the
conclusion on its own that **the library is the bottleneck** and consumers fan out from it. **[T47]**

Weak answer: a per-repository description with no dependency relationship drawn between them.

### 2. "We want to get from Angular 14 to 18, and eventually to 22. What breaks?"

The answer everyone in the room is waiting for. Listen for:

- Material's MDC migration at 15 invalidating Canopy's internal class overrides, with specific
  components named — chips and slider are full rewrites, not renames **[T8, T9]**
- typography level names changing at 15 **[T1]**
- `@angular/flex-layout` reaching end of life at 15, used in Canopy layout and fifteen `retail-web`
  templates **[T15]**
- `relativeLinkResolution` removed at 15, `CanLoad` deprecated **[T19, T21]**
- the `zone.js/dist/zone` deep import failing at 15 **[T18]**
- ngcc removed at 16, and `@meridian/lantern-sdk` being a View Engine package, so a vendor-owned
  republish is on the critical path **[T39, T22]**
- Node 14 dropped at 16, blocked by `engine-strict` and a Jenkins agent label owned by another team
  **[T33, T34]**
- `HttpClientModule` and `HttpClientXsrfModule` deprecated at 18 **[T20]**
- the Webpack browser builder giving way to the application builder at 18, deprecated by 22
  **[T40]**
- `keystone-web` sitting on legacy Material imports that are deleted at 17 **[T36]**

The best answers separate *what the compiler will tell you* from *what it will not*: the style
overrides that silently stop matching, and the visual regressions that follow.

### 3. "How many places override Angular Material internals, and where?"

Expect an inventory, not a number. Seventeen in Canopy **[T2–T14, T17]**, plus `business-web`
reaching in from outside with `::ng-deep` and `ViewEncapsulation.None` **[T30]**, plus
`ledgerline-web`'s local reimplementation of the chips component **[T38]**.

Follow up with: **"Which of those can be fixed mechanically and which need a designer?"** A good
answer puts chips, slider and the currency input's form field alignment in the designer column.

### 4. "Has anyone tried this before?"

Devin should find `feature/MOL-3801-angular15-spike` and `retail-web/SPIKE_NOTES.md`, summarise why
it was abandoned in early 2025 — Canopy's Material overrides, flex-layout's end of life, the Lantern
SDK — and note the branch does not compile. **[T29]**

It should also find `keystone-web`'s half-finished `feature/KEY-2210-mdc-migration`. **[T36]**

### 5. "What is our test coverage really like, and where is the risk?"

Around 30 percent overall, and — the important part — *lowest where it matters most*:
`pii-vault-service` at 8 percent, `audit-trail-service` at 12, `txn-posting-service` at 18 with no
tests on reversals or idempotency, Beacon's per-customer ordering logic untested, and two Python
services with no test framework at all. **[T44, T45, T46]**

In the front end: 20 `retail-web` components with no spec, concentrated in transfers and bill pay.

A good answer says plainly that the upgrade's real risk is not the compile errors, it is that the
tests will not catch what the compile does not.

### 6. "What is in this estate that a security reviewer should look at?"

`bypassSecurityTrustHtml` in `cn-disclosure` **[T16]**, the commented `strict-ssl=false` and
`always-auth=true` in `retail-web/.npmrc` **[T28]**, the two unresolved advisories and the
`overrides` block **[T27]**, and the device fingerprinting service in `keystone-web`. It should
*not* propose silently removing the sanitisation bypass.

---

## Act two — do the work

### 7. Run playbook one against `canopy-ui`, 14 to 15

Watch for: the inventory produced *before* the schematics run, the chips and slider rewrites, the
typography level rename, the honest test rewrites where a spec asserted a Material class **[T17]**,
and a migration report that lists deferred items instead of doing them.

The moment to point at: **it builds the consumers too.** A green library build means nothing here.

### 8. Run playbook two — the Canopy Material migration

The point of this run is that **it stops**. It should produce the inventory, do the mechanical work,
capture before-and-after screenshots across light, dark and high contrast, run the accessibility
check, and then halt at the parity questions — slider tick intervals, chip selection semantics, the
currency input's prefix alignment — and wait for a human.

If it opens a pull request without asking, the playbook has failed, and that is worth saying out
loud rather than glossing over.

### 9. Launch the consumer upgrades in parallel

Five sessions: `retail-web`, `business-web`, `keystone-web`, `ledgerline-web`, `iris-widget`.

Expect them to behave differently, because the repositories are different:

- `business-web` should discover it needs a **two-hop** on Canopy, plus RxJS 6 to 7 and the Node
  floor first, and should say the agent label change needs Platform Engineering **[T31, T33, T34]**
- `ledgerline-web` should propose **deleting** its `patch-package` patch and its `canopy-compat`
  directory, because the new library makes both unnecessary **[T37, T38]**
- `keystone-web` should finish the MDC migration rather than start a new one **[T36]**
- `iris-widget` and `retail-web` should both raise the shared Zone.js problem, and ideally notice
  they have to ship together **[T35]**

### 10. Devin Review on a migration pull request

Ask for a review on the `retail-web` upgrade. A realistic finding surfaces: the sanitisation bypass
reachable from the disclosure component, or the XSRF configuration changing shape during the
`provideHttpClient` migration **[T20]**, or a retargeted style override that silently changed a
focus indicator's contrast.

---

## Act three — the awkward questions

Keep these for the room; they are the ones a sceptical audience actually asks.

**"How long would this take my team?"** Devin should answer in work items and dependencies — library
first, five consumers in parallel, two external dependencies (the Lantern republish and the Jenkins
agent image) that are not on the app team's critical path at all — rather than in a single number.

**"What can't you do?"** Good answers: decide the visual questions, get the vendor to republish the
Lantern SDK, change the Jenkins agent images, alter a Bedrock copybook, or approve a change through
CAB.

**"What would you do first, if you had one week?"** Listen for: characterisation tests on the
untested compliance-critical paths, or the prerequisite work (RxJS, Node floor, agent labels) that
unblocks everything else — not the framework bump itself.

**"Show me you understood the bank, not just the code."** Ask it to explain the release train, the
freeze windows, who signs off a visual change, and why `business-web` is two versions behind. The
answers are in the repositories.
