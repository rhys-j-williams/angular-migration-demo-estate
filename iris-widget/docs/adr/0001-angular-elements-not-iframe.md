# ADR 0001: Ship Iris as an Angular Elements custom element, not an iframe

Status: accepted, 2022-06-14. Digital Assistant squad (d.okafor, m.calderon). Reviewed by
cswt-architecture 2022-06-21.

## Context

Iris v1 was a page inside retail-web (`/help/chat`). Product want it on every Meridian page,
including business-web (Angular 12, different team, different release train) and the marketing
pages (no Angular at all). Copying the component into three codebases was rejected before we got
to the meeting.

Options on the table:

1. An iframe pointing at a small hosted page. Total isolation, works anywhere, own release cadence.
2. A web component built with Angular Elements, loaded at runtime from a script tag.
3. A framework-agnostic rewrite (Lit or plain custom elements).

## Decision

Option 2.

The iframe lost on three things. The auth token: the orchestrator binds a session to the customer
and the token lives in the host's Angular app, so the iframe needs postMessage plumbing that GIS
were not keen on (GIS-1522 review notes). The toast: Canopy's toast renders into the document
overlay container and an iframe cannot escape its box, so a full-height transparent iframe over the
whole page was proposed and everyone went quiet. And the mobile app WebView, which at the time did
not allow nested frames.

Option 3 was a rewrite of a thing we had just written, by a team of two.

## Consequences

- One bundle, one element, loaded by the host at runtime. The host contract is in the README.
- **Two Angular applications on one page share one Zone.js.** This was known at the time and
  written down as "the host provides Zone, we must stay on a compatible Angular". See ADR 0002 for
  how that was resolved and what it costs. It is the single biggest constraint on the widget and
  will be the single biggest constraint on the host's next upgrade.
- Emulated view encapsulation rather than Shadow DOM, because the overlay container problem is the
  same for Shadow DOM as for iframes (tried in IRIS-0418, reverted).
- No lazy loading anywhere in the widget, because a second chunk has no server to come from
  (ADR 0003).
- business-web never took it. The marketing pages did, briefly, and dropped it when the CMS vendor
  changed. So the "every Meridian page" goal produced exactly one host, retail-web, which is also
  where it started. The architecture is still right; the business case was optimistic.
