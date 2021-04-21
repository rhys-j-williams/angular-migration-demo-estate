import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { COMPONENT_PAGES } from '../components/component-pages';

@Component({
  selector: 'cs-home-page',
  template: `
    <cn-page-header title="Canopy design system" eyebrow="@meridian/canopy-ui 3.7.2"
                    lede="The component library behind Meridian Online, Meridian Business, Keystone, Ledgerline and Lantern. This site is the living style guide; it builds from the same source as the package.">
      <cn-button cnPageAction variant="primary" icon="cn:arrow-right" iconPosition="end" routerLink="/dashboard">Open the banking demo</cn-button>
    </cn-page-header>

    <div class="cs-grid" style="margin-top: 24px">
      <cn-card title="Install" subtitle="ng add wires the theme and the sprite">
        <pre class="cs-code">npm install @meridian/canopy-ui@3.7.2
ng add @meridian/canopy-ui</pre>
        <p class="cs-muted">Registry is the internal Artifactory virtual repo; locally the estate runs Verdaccio on 4873. See the README.</p>
      </cn-card>
      <cn-card title="Import per family" subtitle="Keeps the consumer bundle honest">
        <pre class="cs-code">import {{ '{' }} CnDataTableModule {{ '}' }} from '@meridian/canopy-ui/data-display';
import {{ '{' }} CnCurrencyInputModule {{ '}' }} from '@meridian/canopy-ui/forms';</pre>
        <p class="cs-muted">The root entry point still re-exports everything for the older apps. New code should not use it (CONTRIBUTING.md).</p>
      </cn-card>
      <cn-card title="Theme" subtitle="One mixin, three variants">
        <pre class="cs-code">@use '@meridian/canopy-ui/themes' as canopy;
@include canopy.theme();</pre>
        <p class="cs-muted">Light and high contrast are emitted together and switched by a class on html. Try the toggle in the top bar.</p>
      </cn-card>
    </div>

    <cn-divider label="Component index" spacing="lg"></cn-divider>

    <cn-list [items]="index" [interactive]="true" ariaLabel="Component index" (itemSelect)="go($event.id)"></cn-list>
  `
})
export class HomePageComponent {
  readonly index = COMPONENT_PAGES.map(p => ({
    id: p.slug,
    primary: p.selector,
    secondary: p.summary,
    meta: p.family,
    icon: 'cn:chevron-right'
  }));

  constructor(private readonly router: Router) {}

  go(slug: string): void {
    this.router.navigate(['/components', slug]);
  }
}
