import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-stepper-shell-page',
  template: `
    <cs-demo-page title="cn-stepper-shell" selector="cn-stepper-shell" importFrom="navigation" imports="CnStepperShellModule" lede="Linear stepper with per-step form controls and completion events.">

  <cs-demo-section title="Send money" note="Each cnStep can carry a control; linear mode blocks Continue until it is valid. The consumer owns the submit.">
    <cn-stepper-shell [linear]="true" finishLabel="Send" [busy]="sending" (completed)="send()" (cancelled)="reset()" (stepChange)="step = $event">
      <ng-template cnStep label="Recipient" [control]="form.get('payee')">
        <div style="max-width: 420px">
          <cn-select label="Payee" [options]="payees" [formControl]="payeeCtrl" [required]="true"></cn-select>
        </div>
      </ng-template>
      <ng-template cnStep label="Amount" [control]="form.get('amount')">
        <mat-form-field appearance="outline" style="max-width: 420px">
          <mat-label>Amount</mat-label>
          <cn-currency-input [formControl]="amountCtrl" [min]="1" [max]="5000"></cn-currency-input>
        </mat-form-field>
      </ng-template>
      <ng-template cnStep label="Memo" [optional]="true">
        <cn-masked-input label="Memo" preset="custom" mask="S*" [formControl]="memoCtrl" hint="Optional, shown to the recipient"></cn-masked-input>
      </ng-template>
      <ng-template cnStep label="Review">
        <dl class="cs-dl">
          <dt>To</dt><dd>{{ payeeLabel }}</dd>
          <dt>Amount</dt><dd>{{ amountCtrl.value | cnCurrency }}</dd>
          <dt>Memo</dt><dd>{{ memoCtrl.value || '-' }}</dd>
        </dl>
      </ng-template>
    </cn-stepper-shell>
    <p class="cs-muted">step {{ step }} {{ sent ? '- sent (simulated)' : '' }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class StepperShellPageComponent {
  step = 0;
  sending = false;
  sent = false;
  readonly payees: CnSelectOption<string>[] = this.fixtures.payees.map(p => ({ value: p.payeeId, label: p.name, description: p.nickname }));
  readonly form = this.fb.group({
    payee: [null as string | null, Validators.required],
    amount: [null as number | null, Validators.required],
    memo: ['']
  });
  get payeeCtrl(): FormControl { return this.form.get('payee') as FormControl; }
  get amountCtrl(): FormControl { return this.form.get('amount') as FormControl; }
  get memoCtrl(): FormControl { return this.form.get('memo') as FormControl; }
  get payeeLabel(): string { return this.payees.find(p => p.value === this.payeeCtrl.value)?.label ?? '-'; }
  send(): void {
    this.sending = true;
    setTimeout(() => {
      this.sending = false;
      this.sent = true;
      this.toast.success(`Sent ${this.amountCtrl.value} to ${this.payeeLabel}`);
    }, 1200);
  }
  reset(): void {
    this.form.reset({ memo: '' });
    this.sent = false;
  }
  constructor(private readonly fb: FormBuilder, private readonly fixtures: ShowcaseFixturesService, private readonly toast: CnToastService) {}
}
