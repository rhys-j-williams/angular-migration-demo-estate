import { Component } from '@angular/core';
import { CnRadioOption } from '@meridian/canopy-ui/forms';

@Component({
  selector: 'cs-radio-group-page',
  template: `
    <cs-demo-page title="cn-radio-group" selector="cn-radio-group" importFrom="forms" imports="CnRadioGroupModule, CnRadioOption" lede="Fieldset-backed radio group with descriptions and inline layout.">

  <cs-demo-section title="Transfer speed" note="Renders a real fieldset and legend. Descriptions are read as part of the option.">
    <cn-radio-group legend="Delivery" [options]="speeds" [(ngModel)]="speed" [required]="true"></cn-radio-group>
    <cn-radio-group legend="Frequency" [options]="freq" [(ngModel)]="frequency" [inline]="true" errorText="Choose a frequency"></cn-radio-group>
    <pre class="cs-code">speed: {{ speed }}   frequency: {{ frequency }}</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class RadioGroupPageComponent {
  speed = 'standard';
  frequency: string | null = null;
  readonly speeds: CnRadioOption<string>[] = [
    { value: 'standard', label: 'Standard (ACH)', description: 'Arrives in 1 to 3 business days. No fee.' },
    { value: 'same-day', label: 'Same day', description: 'Submit before 2:00 PM ET. $3.00 fee.' },
    { value: 'wire', label: 'Wire', description: 'Domestic wires only from this channel.', disabled: true }
  ];
  readonly freq: CnRadioOption<string>[] = [
    { value: 'once', label: 'Once' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }
  ];
}
