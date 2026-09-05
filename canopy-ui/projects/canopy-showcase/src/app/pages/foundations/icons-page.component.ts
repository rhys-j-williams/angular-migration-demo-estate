import { Component } from '@angular/core';
import { CN_ICON_NAMES } from '@meridian/canopy-ui/icons';

@Component({
  selector: 'cs-icons-page',
  template: `
    <cn-page-header title="Icons" eyebrow="Foundations"
                    lede="One SVG sprite, registered under the cn namespace with MatIconRegistry when CnIconModule is imported. Icons are 24px on a 24 grid and inherit currentColor.">
    </cn-page-header>
    <div class="cs-stack" style="margin-top: 24px">
      <cn-card title="Usage">
        <pre class="cs-code">&lt;mat-icon svgIcon="cn:transfer" aria-hidden="true"&gt;&lt;/mat-icon&gt;
&lt;cn-icon-button icon="cn:bell" ariaLabel="Alerts" [badge]="3"&gt;&lt;/cn-icon-button&gt;</pre>
        <p class="cs-muted">The sprite ships in the package at src/lib/icons/canopy-sprite.svg; ng add copies it to /assets/canopy. Adding an icon is a CNPY ticket with the design team, not a pull request with an SVG pasted in.</p>
      </cn-card>
      <cn-card title="Sprite contents" [subtitle]="names.length + ' icons'">
        <div class="cs-icon-grid">
          <figure *ngFor="let name of names">
            <mat-icon [svgIcon]="'cn:' + name" aria-hidden="true"></mat-icon>
            <figcaption>cn:{{ name }}</figcaption>
          </figure>
        </div>
      </cn-card>
    </div>
  `
})
export class IconsPageComponent {
  readonly names = CN_ICON_NAMES;
}
