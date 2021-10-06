import { Component } from '@angular/core';
import { CnDateRange } from '@meridian/canopy-ui/forms';

@Component({
  selector: 'cs-date-range-page',
  template: `
    <cs-demo-page title="cn-date-range" selector="cn-date-range" importFrom="forms" imports="CnDateRangeModule, CnDateRange" lede="Start/end picker over the Material range picker with presets.">

  <cs-demo-section title="Statement period" note="Presets emit presetApplied as well as rangeChange. Dates are ISO strings on the way out; moment is only used internally.">
    <div style="max-width: 520px">
      <cn-date-range label="Statement period" [(ngModel)]="range" [maxDate]="today" hint="Up to 24 months of history"
                     (rangeChange)="changes = changes + 1" (presetApplied)="preset = $event.label"></cn-date-range>
    </div>
    <pre class="cs-code">{{ range | json }}   preset: {{ preset || '-' }}   changes: {{ changes }}</pre>
    <div style="max-width: 520px; margin-top: 16px">
      <cn-date-range label="Without presets" [showPresets]="false" appearance="fill" [(ngModel)]="other"></cn-date-range>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class DateRangePageComponent {
  range: CnDateRange | null = null;
  other: CnDateRange | null = null;
  preset = '';
  changes = 0;
  readonly today = new Date().toISOString().slice(0, 10);
}
