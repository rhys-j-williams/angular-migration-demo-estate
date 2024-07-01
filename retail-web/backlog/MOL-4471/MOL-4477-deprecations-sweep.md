# MOL-4477 Small deprecations sweep

Parent: MOL-4471. Do this last, just before MOL-4475, so the migrations have less to do.

- `.toPromise()` x6 in cards and statements to `firstValueFrom` / `lastValueFrom`. Watch the
  empty-stream behaviour on the card reveal (see SPIKE_NOTES).
- `CanLoad` to `CanMatch` in `LazyModuleGuard`. Three routes.
- `relativeLinkResolution: 'legacy'` removed from the router config. Check the two places we
  use relative `routerLink` from a child route (statements viewer back link, card detail tabs).
- `HttpClientXsrfModule.withOptions` to `provideHttpClient(withXsrfConfiguration(...))`. Keep
  `MERIDIAN-XSRF` / `X-MERIDIAN-XSRF`; the BFF checks the header name.
- `zone.js/dist/zone` to `zone.js` in `polyfills.ts`.
- `UntypedFormBuilder` stays. ADR 0012, separate decision.
- `@angular/flex-layout` is MOL-4474, not here.
