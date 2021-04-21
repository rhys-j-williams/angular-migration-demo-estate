import { Component } from '@angular/core';

@Component({
  selector: 'cs-tooltip-page',
  template: `
    <cs-demo-page title="cn-tooltip" selector="cn-tooltip" importFrom="overlays" imports="CnTooltipModule" lede="cnTooltip directive with brand styling and a 300ms delay.">

  <cs-demo-section title="Directive" note="Tooltips never carry information that is not available elsewhere. The 300ms delay stops them flashing while the pointer crosses a toolbar.">
    <div class="cs-row">
      <cn-button variant="secondary" cnTooltip="Downloads a PDF for the selected period">Download</cn-button>
      <cn-button variant="secondary" cnTooltip="Shown above" cnTooltipPosition="above">Above</cn-button>
      <cn-button variant="secondary" cnTooltip="Shown to the right" cnTooltipPosition="right">Right</cn-button>
      <cn-button variant="secondary" cnTooltip="You should not see this" [cnTooltipDisabled]="true">Disabled tooltip</cn-button>
      <span cnTooltip="Available balance excludes pending card holds" tabindex="0" class="cs-help">Available balance <mat-icon svgIcon="cn:help" inline></mat-icon></span>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class TooltipPageComponent {
}
