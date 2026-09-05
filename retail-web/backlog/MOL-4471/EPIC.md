# MOL-4471 Angular upgrade, Meridian Online

Owner: Deborah Okafor. Architecture contact: Wataru Tanaka. AppSec: Chidi Mbeki (GIS-2207).
Status: Deferred to 2025 per ADR 0014 (June 2024), reconfirmed November 2024.

## Why

Angular 14 is out of LTS. GIS-2207 medium finding, risk-accepted with compensating controls.
Canopy, flex-layout and Lantern make this a multi-quarter effort rather than an `ng update`.
See `docs/adr/0014-defer-angular-upgrade-2024.md` and `SPIKE_NOTES.md` for the spike that
established that.

## Target

Not decided. The spike targeted 15. By the time this is funded 15 will itself be out of LTS, so
the working assumption is "whatever is current when we start", one major at a time through the
CLI migrations, with a stop at each major to run the full regression pack.

## Sequencing (from the ADR 0014 discussion)

1. MOL-4472 Lantern SDK: vendor Ivy build or replacement. External dependency, start first.
2. MOL-4473 Canopy 4 adoption, jointly with business-web (MBZ-2210).
3. MOL-4474 flex-layout removal, CSS grid/flex, visual regression per feature.
4. MOL-4475 Framework upgrade proper, one major per PR.
5. MOL-4476 Test coverage in transfers and bill pay before 4475 touches forms.
6. MOL-4477 Small deprecations sweep (toPromise, CanLoad, XSRF module, zone import, router options).
7. MOL-4478 Build tooling: esbuild builder, tsconfig strictness, drop Protractor.
8. MOL-4479 Dependency hygiene: overrides, @types/node pin, advisories.

4476 can run in parallel with 4472 and is the only one that does not need the others.

## Not in scope

- Standalone components migration. Separate epic if ever.
- NgRx signals / functional effects. Same.
- Replacing ngx-translate. ADR 0009 stands.

## Estimate

Spike said "a quarter of the team, probably two". Nobody has refined it since. Do not quote that
number to the PMO as a commitment.

## Risks

- Canopy 4 not funded. Whole epic blocks on it.
- Lantern vendor. See MOL-4472. Procurement lead time if we replace.
- Ledgerline cut-over and RTP work compete for the same people through 2025.
- Regression pack for transfers is partly manual (payments-platform own the harness).
