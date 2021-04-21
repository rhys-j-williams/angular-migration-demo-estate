import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-currency-input-page',
  template: `
    <cs-demo-page title="cn-currency-input" selector="cn-currency-input" importFrom="forms" imports="CnCurrencyInputModule" lede="Money field that formats on blur and exposes a number to the form.">

  <cs-demo-section title="Reactive form" note="Value is a number in major units. Min/max validation reports through the form group; the prefix aligns with the Material underline.">
    <form [formGroup]="form" class="cs-stack" style="max-width: 420px">
      <mat-form-field appearance="outline">
        <mat-label>Amount</mat-label>
        <cn-currency-input formControlName="amount" [min]="0.01" [max]="available" placeholder="0.00"></cn-currency-input>
        <mat-hint>Available {{ available | cnCurrency }}</mat-hint>
        <mat-error *ngIf="form.get('amount')?.hasError('max')">Exceeds available balance</mat-error>
        <mat-error *ngIf="form.get('amount')?.hasError('required')">Enter an amount</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Fee (negative allowed)</mat-label>
        <cn-currency-input formControlName="fee" [allowNegative]="true"></cn-currency-input>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Disabled</mat-label>
        <cn-currency-input formControlName="locked"></cn-currency-input>
      </mat-form-field>
    </form>
    <pre class="cs-code">{{ form.value | json }}   valid: {{ form.valid }}</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class CurrencyInputPageComponent {
  readonly available = this.fixtures.summaries()[0].availableBalance ?? 0;
  readonly form = this.fb.group({
    amount: [125.5, [Validators.required]],
    fee: [-2.5],
    locked: [{ value: 1000, disabled: true }]
  });
  constructor(private readonly fb: FormBuilder, private readonly fixtures: ShowcaseFixturesService) {}
}
