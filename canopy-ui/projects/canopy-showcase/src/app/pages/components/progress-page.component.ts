import { Component } from '@angular/core';

@Component({
  selector: 'cs-progress-page',
  template: `
    <cs-demo-page title="cn-progress" selector="cn-progress" importFrom="feedback" imports="CnProgressModule" lede="Determinate and indeterminate progress bars and spinners with thresholds.">

  <cs-demo-section title="Utilisation" note="Thresholds switch the tone as the value climbs: the credit utilisation bar goes caution at 70 and warn at 90.">
    <div class="cs-stack" style="max-width: 520px">
      <cn-progress [value]="utilisation" label="Credit utilisation" [showValue]="true" [thresholds]="{ caution: 70, warn: 90 }"></cn-progress>
      <div class="cs-row">
        <cn-button variant="tertiary" size="small" (pressed)="utilisation = utilisation - 10">-10</cn-button>
        <cn-button variant="tertiary" size="small" (pressed)="utilisation = utilisation + 10">+10</cn-button>
      </div>
      <cn-progress [value]="62" label="Savings goal" tone="success" [showValue]="true"></cn-progress>
      <cn-progress [value]="null" label="Posting transfer"></cn-progress>
    </div>
  </cs-demo-section>
  <cs-demo-section title="Circular">
    <div class="cs-row">
      <cn-progress [circular]="true" [value]="utilisation" [diameter]="48" label="Utilisation" [showValue]="true"></cn-progress>
      <cn-progress [circular]="true" [value]="null" [diameter]="24" label="Loading"></cn-progress>
      <cn-progress [circular]="true" [value]="100" [diameter]="32" tone="success" label="Done"></cn-progress>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class ProgressPageComponent {
  utilisation = 45;
}
