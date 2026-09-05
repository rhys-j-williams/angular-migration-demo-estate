import { Component } from '@angular/core';

@Component({
  selector: 'cs-amount-slider-page',
  template: `
    <cs-demo-page title="cn-amount-slider" selector="cn-amount-slider" importFrom="forms" imports="CnAmountSliderModule" lede="Currency-formatted slider with thumb label and ticks.">

  <cs-demo-section title="Savings goal" note="Thumb label shows the formatted currency; ticks every step. Used in the goal planner and the loan calculator.">
    <div style="max-width: 560px" class="cs-stack">
      <cn-amount-slider label="Monthly contribution" [min]="0" [max]="2000" [step]="25" [(ngModel)]="monthly" (valueChange)="changes = changes + 1"></cn-amount-slider>
      <cn-amount-slider label="Loan amount" [min]="5000" [max]="50000" [step]="500" [tickInterval]="10" [(ngModel)]="loan"></cn-amount-slider>
    </div>
    <pre class="cs-code">monthly: {{ monthly | cnCurrency }}   loan: {{ loan | cnCurrency }}   changes: {{ changes }}</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class AmountSliderPageComponent {
  monthly = 250;
  loan = 15000;
  changes = 0;
}
