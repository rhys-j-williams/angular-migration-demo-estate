# @meridian/canopy-ui

Meridian Trust Bank's Angular component library. Angular 14, Material 14.

```
ng add @meridian/canopy-ui
```

Then import the entry point you need:

```ts
import { CnButtonModule } from '@meridian/canopy-ui/actions';
import { CnDataTableModule, CnFilterChipsModule } from '@meridian/canopy-ui/data-display';
```

Entry points: `core`, `icons`, `a11y`, `actions`, `forms`, `data-display`, `navigation`,
`overlays`, `feedback`, `layout`, `content`. The root entry point re-exports all of them; prefer
the specific one.

Theme:

```scss
@use '@meridian/canopy-ui/styles' as canopy;
@include canopy.theme();
```

Documentation, showcase and the API reports live in the `canopy-ui` repository on the internal
git. Questions to `#canopy-design-system`. Defects as `CNPY` tickets.

The public API (anything exported from an entry point) is frozen within a major. Do not import
from deep paths or override Material class names from an application; both break on the next
release and are rejected in review by CONTRIBUTING.md.
