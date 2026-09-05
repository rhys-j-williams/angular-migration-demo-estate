import { Component } from '@angular/core';

@Component({
  selector: 'cs-button-page',
  template: `
    <cs-demo-page title="cn-button" selector="cn-button" importFrom="actions" imports="CnButtonModule" lede="Primary, secondary, tertiary and destructive buttons with icon and loading states.">

  <cs-demo-section title="Variants" note="One primary per view. Destructive is reserved for irreversible money movement or closing something.">
    <div class="cs-row">
      <cn-button variant="primary" (pressed)="log('primary')">Make transfer</cn-button>
      <cn-button variant="secondary">Schedule</cn-button>
      <cn-button variant="tertiary">Cancel</cn-button>
      <cn-button variant="destructive" icon="cn:alert">Close account</cn-button>
    </div>
  </cs-demo-section>
  <cs-demo-section title="Icons and sizes" note="The gap between icon and text is styled on the Material button wrapper so it survives the label wrapping.">
    <div class="cs-row">
      <cn-button variant="primary" icon="cn:transfer">Transfer</cn-button>
      <cn-button variant="secondary" icon="cn:download" iconPosition="end">Statement</cn-button>
      <cn-button variant="secondary" size="small" icon="cn:filter">Filter</cn-button>
      <cn-button variant="tertiary" size="small">Small tertiary</cn-button>
    </div>
  </cs-demo-section>
  <cs-demo-section title="Loading and disabled" note="Loading keeps the label width so the layout does not jump; the button also becomes aria-disabled.">
    <div class="cs-row">
      <cn-button variant="primary" [loading]="busy" (pressed)="submit()">{{ busy ? 'Submitting' : 'Submit payment' }}</cn-button>
      <cn-button variant="secondary" [disabled]="true">Disabled</cn-button>
      <cn-button variant="primary" [block]="true">Block button</cn-button>
    </div>
    <p class="cs-muted" *ngIf="last">Last pressed: {{ last }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class ButtonPageComponent {
  busy = false;
  last = '';
  log(what: string): void { this.last = what; }
  submit(): void {
    this.busy = true;
    this.last = 'submit';
    setTimeout(() => (this.busy = false), 1400);
  }
}
