# ADR 0003: One bundle, content hashed, plus a stable-name copy and a manifest

Status: accepted, 2022-09-20. Amended 2023-05 (manifest). Digital Assistant squad.

## Context

The Angular CLI's default output is several files (runtime, polyfills, vendor, main, and a chunk
per lazy route) that `index.html` knows how to load. A host loading us from a script tag has no
`index.html` and no way to know the chunk names. It gets one URL.

Cache busting: retail-web's nginx sets a long max-age on `/assets/`. A stable `iris.js` behind that
means a customer keeps an old widget for up to a year.

## Decision

- `ngx-build-plus:browser` with `singleBundle: true`, so the CLI emits exactly one `main.<hash>.js`.
- `outputHashing: bundles`, so the name changes with the content.
- `scripts/postbuild.js` copies it to `iris.js` (stable name, for the help page template that
  predates all this), writes `iris.manifest.json` with the hashed name and sha256, and fails if
  there is more than one bundle.
- The host vendors the hashed file into its own assets at build time from the manifest. If it
  serves it under the stable name with a long cache, that is the host's problem and it has been
  explained (MOL-4133 comment thread, 41 comments).

## Consequences

- No lazy routes, no dynamic `import()`, no web workers in the widget. Ever. `postbuild.js` will
  fail the build if webpack emits a second file (IRIS-0577 is the reason the check exists).
- Everything Canopy and Material we touch is compiled into the bundle; the tree shaker does its
  job (about 430 KB raw, 105 KB transfer at time of writing).
- The dev shell `index.html` is deleted from `dist/` by postbuild since IRIS-0489, when a copy with
  `localhost:4517` in it reached the CDN.
- `assets/` in the output is real, served alongside the bundle: the Canopy sprite and the Zone UMD.
  The host copies the directory, not just the file. This was missed in the first retail-web
  integration and the icons were empty squares for a sprint.
