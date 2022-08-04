# iris-widget

Angular 14.3.0 / Node 16.20.2 | custom element `<meridian-iris-widget>` | version 1.9.4 | owner **retail-digital**

The Iris virtual assistant chat panel, packaged as a web component through Angular Elements and
loaded at runtime by host pages. It is not an application. There is no router, no login, no
deployable page; there is one JavaScript file and a sprite, served from the host's static assets,
and a contract for how the host puts the element on the page.

Talks to `iris-orchestrator` (platform-services, port 4517), which returns scripted intents from a
YAML file. The widget does not know what intents exist and does not need to.

## Ownership and on call

retail-digital own it in the sense that the CODEOWNERS file says so. In practice the widget has had
three owning squads since 2022 (Digital Assistant, then Conversational, then folded into
retail-digital in 2024 when Conversational was disbanded) and the ADRs still say "Digital
Assistant squad". Nobody has renamed them. m.calderon and b.arceneaux know how it works.

No paging. Iris is best-effort: if the bundle fails to load, retail-web's help page shows the
"chat unavailable" tile and a phone number. If the orchestrator is down the widget shows a system
message saying so. Neither is an incident on its own. Both together at quarter end probably is.

## What is in the box

```
src/main.ts                       registers the element; refuses to start without a host Zone (see below)
src/app/iris-widget.module.ts     the NgModule, no bootstrap component
src/app/widget/                   root component (attribute -> config), launcher
src/app/panel/                    chat panel: header, disclosure, message list, typing, handoff, quick replies, composer
src/app/core/                     orchestrator client, session state, transcript export, config token
src/app/models/                   wire types copied from the orchestrator
scripts/postbuild.js              renames the hashed bundle, writes iris.manifest.json, strips the dev shell
scripts/harness/                  plain HTML mount proof (serve.js, check-mount.js)
webpack.extra.js                  ngx-build-plus extras: uniqueName only
```

Canopy: `cn-icon` (via MatIcon and the sprite), `cn-icon-button`, `cn-button`, `cn-toast` and the
CSS variable tokens. Canopy 3.7.2, exact. See "Canopy and the host" for why the version matters
less than you would think and more than we would like.

## Build and run

```
nvm use                 # 16.20.2
npm ci                  # .npmrc points at the local Verdaccio for @meridian/*, legacy-peer-deps is in there too
npm run lint
npm test -- --watch=false
npm run build:prod      # ng build + scripts/postbuild.js
npm run harness:check   # headless Chrome loads dist/ into a plain page and asserts the element rendered
```

`npm start` serves the dev shell (`src/index.html`) on **4205** with a fake host: the shell loads
Zone.js itself and puts the element on the page with a local orchestrator URL and an unsigned
token that the orchestrator accepts under `MERIDIAN_AUTH_MODE=insecure-local`. Start the
orchestrator first:

```
cd ../platform-services/iris-orchestrator && MERIDIAN_AUTH_MODE=insecure-local npm start
```

Without it you get the "Iris isn't available right now" system message and a red toast, which is
also a legitimate thing to test.

`@types/node` is pinned to 16.18.11. Newer ones declare `Disposable` and TypeScript 4.7 cannot
parse them (BUILD_LOG.md, TOOL-1201). Do not float it.

## Build output

`npm run build:prod` leaves this in `dist/iris-widget/`:

```
main.8edd20c6426fe0ff.js      the bundle, content hashed. This is what you deploy.
iris.js                       byte-identical copy under the stable name the contract uses
iris.manifest.json            { file, stable, bytes, sha256, angular, zoneJsCompatible, builtAt }
assets/canopy/canopy-sprite.svg
assets/vendor/zone.umd.min.js   for hosts that do not already have Zone; retail-web does NOT load this
```

The hash changes on every content change, obviously, so do not copy the one above into anything.
`iris.manifest.json` is the source of truth; retail-web's `scripts/vendor-iris.js` reads `file` from
it at their build time and copies the bundle into their `src/assets/widgets/` (MOL-4133). If they
want cache busting beyond nginx's etag they can point at the hashed name directly; the stable name
exists because the help page template was written before we had a manifest and nobody wants to
touch it.

One bundle, always. `ngx-build-plus` with `singleBundle: true` folds runtime, polyfills (empty, see
below), vendor and main into one file. `postbuild.js` fails the build if it finds a second `.js`,
because a lazy `import()` anywhere in the tree quietly produces a chunk that the host has no way
to serve (IRIS-0577, two days of "works in the dev shell, blank in retail-web").

## Mount contract

This is the part retail-web depends on. Changing any of it is a breaking change and needs a
ticket on their board as well as ours.

**Path.** The host serves the bundle at `/assets/widgets/iris.js` and the sprite at
`/assets/widgets/assets/canopy/canopy-sprite.svg`. Same origin as the host page. The orchestrator
is reached through the host's ingress at `/iris/v1/*` unless `orchestrator-url` says otherwise.

**Load.** A plain script tag, after the host's own Angular bundles have loaded Zone:

```html
<script src="/assets/widgets/iris.js" defer></script>
```

Not `type="module"`. Not inside the Angular app's `scripts` array (that bundles it and defeats the
point of loading it at runtime). retail-web's help page component appends the tag on init and
removes nothing on destroy, because custom elements cannot be undefined; the second visit to the
help page finds `customElements.get('meridian-iris-widget')` already set and `main.ts` returns
early.

**Element.**

```html
<meridian-iris-widget
  orchestrator-url="https://online.meridiantrust.example"   optional; default is same-origin, /iris/v1 is appended
  channel="retail-web"                                      informational, goes in X-Iris-Channel
  bearer-token="..."                                        the customer's Keystone access token. Required to chat.
  sprite-url="/assets/widgets/assets/canopy/canopy-sprite.svg"   optional; this is the default
  open                                                      optional; opens the panel on mount
></meridian-iris-widget>
```

Attributes are dash-case and map to inputs. The host sets `bearer-token` after login and clears it
on logout; clearing it resets the conversation. We never read the token from storage or cookies
ourselves (GIS-1522 said no, correctly).

**Events.** `irisOpen` and `irisClose` are dispatched on the element as CustomEvents. retail-web's
analytics listen for both.

**Styling.** Emulated encapsulation, not Shadow DOM (ADR 0001). Everything is scoped under
`.iris-root` and the widget emits its own Canopy CSS variables there, so a host on a different
Canopy version does not restyle us. The host's global rules can still leak in; if a `button` or
`textarea` rule in retail-web changes and the composer goes strange, that is why (MOL-4188).
Position is `fixed`, bottom right, z-index 1200. If the host has a cookie banner above 1200 the
launcher hides behind it. Yes this has happened.

## Zone.js and the host page

Read this one even if you skip the rest.

The widget does **not** bundle Zone.js. `src/polyfills.ts` is empty on purpose and `main.ts`
throws if `Zone` is not on `window` when the bundle runs. Two Angular applications on one page
cannot each load their own Zone: the second load throws `Zone already loaded` and whichever app
came second never boots (IRIS-0402, the original incident, and MOL-3811 on the retail side). So
the host provides Zone, and the widget uses whatever it finds.

That means **the widget's Angular must be compatible with the host's Zone.js version.** Today:

| | Angular | Zone.js it loads / needs |
|---|---|---|
| retail-web (host) | 14.3.0 | 0.11.8 |
| iris-widget | 14.3.0 | none bundled; built and tested against 0.11.8 |

Angular checks the Zone it finds at runtime; a Zone that is too old for the widget's Angular fails
at boot with an error about `Zone.__load_patch` or `ZoneAwarePromise`, and a Zone that is newer
than the widget was tested against has so far worked but is unsupported. Concretely, for the people
doing the retail-web upgrade:

- **If retail-web moves Angular majors, its Zone.js moves with it, and this widget has to be
  rebuilt on a compatible Angular and re-tested against that Zone before the host ships.** Do them
  in lockstep or the help page breaks on the day the host deploys. There is no runtime version
  check that saves you; the failure is at boot, in the customer's browser, with a console error
  nobody sees.
- Alternatively, isolate the two: put the widget in an iframe (rejected in 2022 for the reasons in
  ADR 0002, mostly the toast overlay and the auth token), or move it to a zoneless bootstrap when
  that stops being experimental. Either is a project, not a ticket.
- `iris.manifest.json` carries `zoneJsCompatible`, the Zone version this bundle was built and
  tested with. retail-web's vendor script could compare it to their own `zone.js` and fail their
  build on a mismatch. It does not, today. IRIS-0790 is open for it, unassigned since it was raised.

The Karma run and the dev shell load their own Zone (`src/test-polyfills.ts`, `src/index.html`)
because there is no host in those contexts. Do not "fix" `polyfills.ts` by adding Zone back to
make some local thing work; you will break production for retail-web the next time they vendor
the bundle, and `postbuild.js` will probably catch you first.

## Canopy and the host

retail-web is on Canopy 3.5.0 and we are on 3.7.2. This is fine because Canopy components are
compiled into our bundle and our tokens are scoped to `.iris-root`. It stops being fine if Canopy
ever moves the toast to a shared overlay container keyed by a global, or if two `CnIconRegistry`
instances start fighting over `mat-icon` names (they do not today; ours is provided in our
injector). The design system team know we exist. Probably.

## Orchestrator contract

Types in `src/app/models/orchestrator.ts`, hand-copied from
`platform-services/iris-orchestrator/src/conversation/conversation.types.ts`. Three endpoints,
all under `/iris/v1`, all needing `Authorization: Bearer <keystone token>`:

```
POST /sessions                      -> Reply (greeting)
POST /sessions/:id/messages  {text} -> Reply
GET  /sessions/:id/transcript       -> Turn[]   (support tooling; the export button does not use it, IRIS-0702)
```

Replies are plain strings, no markdown. `handoff` in a reply means the customer is queued for an
agent and we show the banner with the ticket id. `ended: true` disables the composer. Three
fallback misses in a row and the orchestrator hands off by itself (PLAT-1433); the widget does
nothing special about that, it just renders what comes back.

## Tests

14 Jasmine specs, roughly 77% line coverage on a codebase of two thousand lines, which tells you
more about the size of the codebase than the quality of the tests. There is one component test that
mounts the whole tree and clicks the launcher; the rest are services. There was a coverage gate at
30 percent (IRIS-0233) and it was removed after it blocked a hotfix (IRIS-0490). Sonar reports the
number. The harness check (`npm run harness:check`) is the test that matters and it is not a
Jasmine test at all.

## Known issues

- **IRIS-0790** No build-time check that the host's Zone version matches ours. See above. Open.
- **IRIS-0715** Transcript export is `.txt`. Product want PDF. Legal want the disclaimer on every
  page of the PDF. Nobody wants to write it.
- **IRIS-0640** `channel` is sent and ignored. The orchestrator was going to vary copy on it.
- **IRIS-0522** Root component is `ChangeDetectionStrategy.Default` because OnPush missed the first
  `bearer-token` update in the mobile app's WebView. Children are OnPush. It is fine. It is a chat box.
- **IRIS-0489** The dev shell `index.html` once shipped to the CDN with `localhost:4517` in it.
  `postbuild.js` deletes it now. If you see it in `dist/`, postbuild did not run.
- Safari 14 needs the object URL from the export to survive a tick after the click; there is a
  `setTimeout` in `TranscriptExportService.download` for it (IRIS-0733). Leave it.
- The typing indicator shows for ~50 ms against the scripted orchestrator because that is how long
  it takes. Product asked for it to "feel like typing" (IRIS-0350). It does not.

## Documents

- `docs/adr/0001-angular-elements-not-iframe.md`
- `docs/adr/0002-host-provides-zone.md`
- `docs/adr/0003-single-bundle-stable-name.md`
- `docs/runbooks/embedding-in-a-host.md`
- `docs/runbooks/widget-not-appearing.md`
- `docs/runbooks/release.md`
- `CHANGELOG.md`
