import { Component } from '@angular/core';
import { CnThemeName, CnThemeService } from '@meridian/canopy-ui/core';

@Component({
  selector: 'cs-themes-page',
  template: `
    <cn-page-header title="Themes" eyebrow="Foundations"
                    lede="Light is the default. Dark shipped in 3.6.0 for Meridian Online's evening mode; high contrast follows forced-colors and is required by the accessibility statement.">
    </cn-page-header>
    <div class="cs-stack" style="margin-top: 24px">
      <cn-card title="Switch theme" subtitle="CnThemeService toggles cn-theme-* on the html element and persists the choice when a storage key is configured.">
        <cn-radio-group legend="Active theme" [options]="options" inline [ngModel]="theme$ | async" (ngModelChange)="set($event)"></cn-radio-group>
        <pre class="cs-code">constructor(private theme: CnThemeService) {{ '{' }}{{ '}' }}
this.theme.setTheme('dark');
this.theme.toggleDark();</pre>
      </cn-card>
      <cn-card title="What a theme is" subtitle="The mixin, from themes/_theme.scss">
        <pre class="cs-code">@use '@angular/material' as mat;
@use '@meridian/canopy-ui/themes' as canopy;

@include canopy.theme($include-dark: true, $include-high-contrast: true);

// Custom palettes are possible but need a design review (CNPY-1402):
$brand: mat.define-palette(canopy.$cn-green-palette, 600);</pre>
        <p class="cs-muted">The mixin calls mat.core() once, builds the light theme with mat.all-component-themes and layers the dark and high contrast colour sets with mat.all-component-colors under their class.</p>
      </cn-card>
      <cn-card title="Sample surface" subtitle="Same markup under whichever theme is active">
        <div class="cs-row">
          <cn-button variant="primary">Primary</cn-button>
          <cn-button variant="secondary">Secondary</cn-button>
          <cn-button variant="destructive">Destructive</cn-button>
          <cn-badge tone="success">Posted</cn-badge>
          <cn-badge tone="caution">Pending</cn-badge>
          <cn-progress [value]="64" label="Statement generation" showValue style="min-width: 240px"></cn-progress>
        </div>
      </cn-card>
    </div>
  `
})
export class ThemesPageComponent {
  readonly options = [
    { value: 'light' as CnThemeName, label: 'Light' },
    { value: 'dark' as CnThemeName, label: 'Dark' },
    { value: 'high-contrast' as CnThemeName, label: 'High contrast' }
  ];
  readonly theme$ = this.themes.theme$;

  constructor(private readonly themes: CnThemeService) {}

  set(theme: CnThemeName): void {
    this.themes.setTheme(theme);
  }
}
