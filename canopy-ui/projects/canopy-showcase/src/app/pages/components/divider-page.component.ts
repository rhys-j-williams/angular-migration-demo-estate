import { Component } from '@angular/core';

@Component({
  selector: 'cs-divider-page',
  template: `
    <cs-demo-page title="cn-divider" selector="cn-divider" importFrom="data-display" imports="CnDividerModule" lede="Horizontal or vertical rule with optional label.">

  <cs-demo-section title="Spacing and labels">
    <p>Above, spacing none</p>
    <cn-divider spacing="none"></cn-divider>
    <p>Default spacing</p>
    <cn-divider></cn-divider>
    <cn-divider label="Earlier this month" spacing="lg"></cn-divider>
    <cn-divider [inset]="true"></cn-divider>
    <div class="cs-row" style="height: 40px">
      <span>Checking</span><cn-divider [vertical]="true"></cn-divider><span>Savings</span><cn-divider [vertical]="true"></cn-divider><span>Credit</span>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class DividerPageComponent {
}
