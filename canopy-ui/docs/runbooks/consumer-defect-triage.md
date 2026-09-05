# Runbook: a consumer reports a Canopy defect during an incident

Canopy has no production footprint of its own, so this runbook is about what to do when an
incident commander for Meridian Online, Meridian Business, Ledgerline, Keystone or Iris pulls the
Canopy rota (`CSWT-CANOPY-L2`) into a bridge.

## First five minutes

1. Get the consumer's Canopy version from their lockfile, not from what they tell you. Business
   is on 3.5.0 and people forget.
2. Get the browser and assistive technology if it is an accessibility incident. Most of our
   "Canopy is broken" pages since 2023 have been a screen reader update, not us.
3. Reproduce on the showcase at the same version. Checkout `canopy-ui/vX.Y.Z`, `npm ci`,
   `npm start`, open 4204. If the showcase page for the component behaves correctly, the defect
   is in the consumer's usage and you can say so on the bridge with the page URL as evidence.
4. If the showcase reproduces it, it is ours. Say so quickly. Open a `CNPY` ticket with the
   incident number in the summary and link it from the bridge.

## Mitigation options, in order of preference

- Consumer side workaround that does not touch Canopy internals: a different input value, a
  wrapper component, a feature flag. This is nearly always available and is what the bridge wants.
- Consumer side style override. Only if the incident is Sev 1 or Sev 2 and there is no other
  option. It must be scoped to one page, must carry the `CNPY` ticket in a comment, and the
  consumer team must agree on the bridge to remove it when the Canopy fix ships. This has gone
  wrong twice (LDG-3104 is the current instance), which is why CONTRIBUTING.md forbids it outside
  an incident.
- Canopy patch release. Follow `publish-a-release.md`. A patch from `develop` takes about an hour
  end to end if the fix is small. If the consumer is not on the latest minor, you are cutting a
  patch off the tag they are on (`canopy-ui/v3.5.x` for Business), which means a branch from the
  tag, a cherry pick and a separate tag. Do not merge that branch back.

## After the bridge

- Post incident review actions for Canopy go in the `CNPY` ticket, not in the consumer's.
- If the defect was a consumer reaching into internals, write it up in the ticket without
  editorialising and link ADR-0004. The pattern is recorded there for the 4.0 planning.
- If the defect was in a Material internal we override, add the component to the list in
  ADR-0004 if it is not already there.

## Things that look like Canopy defects and are not

- Theme not applied: the consumer's root stylesheet does not include `canopy.theme()` after a
  refactor, or includes it inside a component stylesheet (encapsulated, so nothing global).
- Icons missing: sprite not copied to `assets/canopy`. `ng add` does this; a hand rolled build
  did not.
- Currency formatting wrong: consumer's `LOCALE_ID` provider, not `CnCurrencyFormatService`.
- Date range off by one day: Moment in the consumer resolving to a different timezone than the
  date adapter. Every time.
