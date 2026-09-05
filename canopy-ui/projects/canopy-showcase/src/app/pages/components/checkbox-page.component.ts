import { Component } from '@angular/core';

@Component({
  selector: 'cs-checkbox-page',
  template: `
    <cs-demo-page title="cn-checkbox" selector="cn-checkbox" importFrom="forms" imports="CnCheckboxModule" lede="Checkbox with hint text and indeterminate parent state.">

  <cs-demo-section title="Alert preferences" note="Parent checkbox goes indeterminate when only some children are on.">
    <div class="cs-stack">
      <cn-checkbox [ngModel]="allOn" [indeterminate]="someOn" (changed)="setAll($event)">All alerts</cn-checkbox>
      <div style="padding-left: 32px" class="cs-stack">
        <cn-checkbox *ngFor="let a of alerts" [(ngModel)]="a.on" [hint]="a.hint">{{ a.label }}</cn-checkbox>
      </div>
      <cn-checkbox [ngModel]="true" [disabled]="true" hint="Required by regulation E">Unauthorised transaction alerts</cn-checkbox>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class CheckboxPageComponent {
  readonly alerts = [
    { label: 'Low balance', hint: 'When available balance drops under $100', on: true },
    { label: 'Large withdrawal', hint: 'Over $500 in one transaction', on: false },
    { label: 'Deposit posted', hint: null as string | null, on: true }
  ];
  get allOn(): boolean { return this.alerts.every(a => a.on); }
  get someOn(): boolean { return !this.allOn && this.alerts.some(a => a.on); }
  setAll(on: boolean): void { this.alerts.forEach(a => (a.on = on)); }
}
