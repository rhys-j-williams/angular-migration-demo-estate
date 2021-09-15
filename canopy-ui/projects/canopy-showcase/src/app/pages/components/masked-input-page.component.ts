import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-masked-input-page',
  template: `
    <cs-demo-page title="cn-masked-input" selector="cn-masked-input" importFrom="forms" imports="CnMaskedInputModule, CnMaskPreset" lede="Preset masks for phone, ZIP, account and routing numbers over ngx-mask.">

  <cs-demo-section title="Presets" note="Presets are the only masks product teams should use directly; custom masks need a design review.">
    <form [formGroup]="form" class="cs-grid">
      <cn-masked-input label="Mobile phone" preset="phone-us" formControlName="phone" hint="US numbers only"></cn-masked-input>
      <cn-masked-input label="ZIP" preset="zip" formControlName="zip"></cn-masked-input>
      <cn-masked-input label="Routing number" preset="routing-number" formControlName="routing" hint="9 digits"></cn-masked-input>
      <cn-masked-input label="Account number" preset="account-number" formControlName="account"></cn-masked-input>
      <cn-masked-input label="SSN (last 4)" preset="ssn-last4" formControlName="ssn4" [required]="true" errorText="Enter the last four digits"></cn-masked-input>
      <cn-masked-input label="Reference" preset="custom" mask="AAA-0000" formControlName="ref" placeholder="ABC-1234"></cn-masked-input>
    </form>
    <pre class="cs-code">{{ form.value | json }}</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class MaskedInputPageComponent {
  readonly form = this.fb.group({
    phone: [''],
    zip: [''],
    routing: ['021000000'],
    account: [''],
    ssn4: ['', Validators.required],
    ref: ['']
  });
  constructor(private readonly fb: FormBuilder, private readonly fixtures: ShowcaseFixturesService) {}
}
