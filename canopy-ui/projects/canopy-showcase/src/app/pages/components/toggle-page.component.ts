import { Component } from '@angular/core';

@Component({
  selector: 'cs-toggle-page',
  template: `
    <cs-demo-page title="cn-toggle" selector="cn-toggle" importFrom="forms" imports="CnToggleModule" lede="Slide toggle with on/off text and hint.">

  <cs-demo-section title="Card controls" note="Label sits before the control by default so a column of toggles lines up. The bar and thumb are restyled to brand colours.">
    <div class="cs-stack" style="max-width: 480px">
      <cn-toggle [(ngModel)]="intl" hint="Blocks card-present transactions outside the US">International purchases</cn-toggle>
      <cn-toggle [(ngModel)]="online" onText="Allowed" offText="Blocked">Online purchases</cn-toggle>
      <cn-toggle [ngModel]="true" [disabled]="true" hint="Managed by the fraud team">Contactless</cn-toggle>
      <cn-toggle [(ngModel)]="paperless" labelPosition="after" (changed)="changes = changes + 1">Paperless statements</cn-toggle>
    </div>
    <p class="cs-muted">intl={{ intl }} online={{ online }} paperless={{ paperless }} changes={{ changes }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class TogglePageComponent {
  intl = false;
  online = true;
  paperless = true;
  changes = 0;
}
