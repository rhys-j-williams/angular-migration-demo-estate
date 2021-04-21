import { Component } from '@angular/core';

interface TokenRow {
  name: string;
  scss: string;
  value: string;
}

@Component({
  selector: 'cs-tokens-page',
  template: `
    <cn-page-header title="Design tokens" eyebrow="Foundations"
                    lede="Every colour, spacing step and type size is a Sass variable in tokens/ and a CSS custom property emitted by the theme mixin. Components consume the custom property so the theme can switch at runtime.">
    </cn-page-header>
    <div class="cs-stack" style="margin-top: 24px">
      <cn-card title="Colour" subtitle="Semantic first. Do not reference palette steps from application code.">
        <div class="cs-grid">
          <div class="cs-swatch" *ngFor="let c of colours">
            <div class="cs-swatch__chip" [style.background]="'var(' + c.name + ')'"></div>
            <code>{{ c.name }}</code>
            <span class="cs-muted">{{ c.scss }}</span>
          </div>
        </div>
      </cn-card>
      <cn-card title="Spacing" subtitle="4px base. Layouts use the scale, never arbitrary pixel values.">
        <table class="cs-token-table">
          <thead><tr><th scope="col">CSS property</th><th scope="col">Sass</th><th scope="col">Value</th><th scope="col"></th></tr></thead>
          <tbody>
            <tr *ngFor="let s of spacing">
              <td><code>{{ s.name }}</code></td><td><code>{{ s.scss }}</code></td><td>{{ s.value }}</td>
              <td><div [style.width]="s.value" style="height: 12px; background: var(--cn-color-primary); border-radius: 2px"></div></td>
            </tr>
          </tbody>
        </table>
      </cn-card>
      <cn-card title="Typography" subtitle="Material typography config built from the type tokens; the mixin applies it through mat.core().">
        <p class="mat-display-1" style="margin: 0 0 8px">Display 1 - account overview totals</p>
        <p class="mat-headline" style="margin: 0 0 8px">Headline - page titles</p>
        <p class="mat-title" style="margin: 0 0 8px">Title - card headings</p>
        <p class="mat-subheading-2" style="margin: 0 0 8px">Subheading 2 - section labels</p>
        <p class="mat-body-1" style="margin: 0 0 8px">Body 1 - running copy. Balances shown are as of close of business and may not reflect pending activity.</p>
        <p class="mat-caption" style="margin: 0">Caption - disclosures, footnotes, table metadata</p>
      </cn-card>
    </div>
  `
})
export class TokensPageComponent {
  readonly colours: TokenRow[] = [
    { name: '--cn-color-primary', scss: '$cn-color-primary', value: '' },
    { name: '--cn-color-primary-contrast', scss: '$cn-color-primary-contrast', value: '' },
    { name: '--cn-color-accent', scss: '$cn-color-accent', value: '' },
    { name: '--cn-color-warn', scss: '$cn-color-warn', value: '' },
    { name: '--cn-color-success', scss: '$cn-color-success', value: '' },
    { name: '--cn-color-caution', scss: '$cn-color-caution', value: '' },
    { name: '--cn-color-surface', scss: '$cn-color-surface', value: '' },
    { name: '--cn-color-surface-alt', scss: '$cn-color-surface-alt', value: '' },
    { name: '--cn-color-border', scss: '$cn-color-border', value: '' },
    { name: '--cn-color-text', scss: '$cn-color-text', value: '' },
    { name: '--cn-color-text-muted', scss: '$cn-color-text-muted', value: '' },
    { name: '--cn-color-info', scss: '$cn-color-info', value: '' },
    { name: '--cn-color-focus', scss: '$cn-color-focus', value: '' }
  ];

  readonly spacing: TokenRow[] = [
    { name: '--cn-space-1', scss: '$cn-space-1', value: '4px' },
    { name: '--cn-space-2', scss: '$cn-space-2', value: '8px' },
    { name: '--cn-space-3', scss: '$cn-space-3', value: '12px' },
    { name: '--cn-space-4', scss: '$cn-space-4', value: '16px' },
    { name: '--cn-space-6', scss: '$cn-space-6', value: '24px' },
    { name: '--cn-space-8', scss: '$cn-space-8', value: '32px' }
  ];
}
