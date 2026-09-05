import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'cs-error-summary-page',
  template: `
    <cs-demo-page title="cn-error-summary" selector="cn-error-summary" importFrom="feedback" imports="CnErrorSummaryModule" lede="Form-level error list that focuses on appearance and links to fields.">

  <cs-demo-section title="Derived from a form" note="Pass the FormGroup and a message map; each item links to the field id. The summary takes focus when it appears, per the accessibility statement.">
    <form [formGroup]="form" (ngSubmit)="submit()" class="cs-stack" style="max-width: 480px" novalidate>
      <cn-error-summary *ngIf="submitted && form.invalid" [form]="form" [messages]="messages" idPrefix="wire-"></cn-error-summary>
      <cn-masked-input label="Routing number" preset="routing-number" formControlName="routing" id="wire-routing" [required]="true"></cn-masked-input>
      <cn-masked-input label="Account number" preset="account-number" formControlName="account" id="wire-account" [required]="true"></cn-masked-input>
      <mat-form-field appearance="outline">
        <mat-label>Amount</mat-label>
        <cn-currency-input formControlName="amount" [min]="1" [max]="25000" id="wire-amount"></cn-currency-input>
      </mat-form-field>
      <div class="cs-row">
        <cn-button variant="primary" type="submit">Send wire</cn-button>
        <cn-button variant="tertiary" (pressed)="form.reset(); submitted = false">Reset</cn-button>
      </div>
    </form>
  </cs-demo-section>
  <cs-demo-section title="Explicit items">
    <cn-error-summary title="We could not process this request" [items]="items" [autoFocus]="false"></cn-error-summary>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class ErrorSummaryPageComponent {
  submitted = false;
  readonly form = this.fb.group({
    routing: ['', [Validators.required, Validators.minLength(9)]],
    account: ['', Validators.required],
    amount: [50000 as number | null, Validators.required]
  });
  readonly messages = {
    routing: { required: 'Enter the routing number', minlength: 'Routing numbers are 9 digits' },
    account: 'Enter the account number',
    amount: { required: 'Enter an amount', max: 'Wires over $25,000 must be sent from a branch' }
  };
  readonly items = [
    { fieldId: 'wire-amount', message: 'Daily wire limit reached' },
    { fieldId: 'wire-routing', message: 'Try again after 9:00 AM ET tomorrow' }
  ];
  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
  }
  constructor(private readonly fb: FormBuilder) {}
}
