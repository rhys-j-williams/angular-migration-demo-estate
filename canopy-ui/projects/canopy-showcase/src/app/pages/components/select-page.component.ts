import { Component } from '@angular/core';
import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-select-page',
  template: `
    <cs-demo-page title="cn-select" selector="cn-select" importFrom="forms" imports="CnSelectModule, CnSelectOption" lede="Single and multi select with grouped options and descriptions.">

  <cs-demo-section title="From account" note="Options carry a description line; the panel class reaches into the Material panel to widen it.">
    <div class="cs-grid">
      <cn-select label="From account" [options]="accounts" [(ngModel)]="from" hint="Only open accounts are listed" (selectionChange)="changes = changes + 1"></cn-select>
      <cn-select label="Statement types" [options]="types" [(ngModel)]="picked" [multiple]="true" appearance="fill"></cn-select>
    </div>
    <pre class="cs-code">from: {{ from }}   types: {{ picked | json }}   changes: {{ changes }}</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class SelectPageComponent {
  from: string | null = null;
  picked: string[] = ['monthly'];
  changes = 0;
  readonly accounts: CnSelectOption<string>[] = this.fixtures.summaries()
    .filter(a => a.status === 'open')
    .map(a => ({ value: a.id, label: a.nickname, description: `•••• ${a.last4}` }));
  readonly types: CnSelectOption<string>[] = [
    { value: 'monthly', label: 'Monthly statement', group: 'Statements' },
    { value: 'annual', label: 'Annual summary', group: 'Statements' },
    { value: '1099', label: '1099-INT', group: 'Tax documents' },
    { value: '1098', label: '1098', group: 'Tax documents', disabled: true }
  ];
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
