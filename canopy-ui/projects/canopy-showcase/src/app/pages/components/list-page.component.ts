import { Component } from '@angular/core';
import { CnListItem } from '@meridian/canopy-ui/data-display';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-list-page',
  template: `
    <cs-demo-page title="cn-list" selector="cn-list" importFrom="data-display" imports="CnListModule, CnListItem" lede="Static or interactive item list with icon, secondary and meta text.">

  <cs-demo-section title="Payees" note="Interactive lists render buttons and emit itemSelect. Static lists are plain list items.">
    <div class="cs-grid">
      <cn-list [items]="payees" [interactive]="true" ariaLabel="Payees" (itemSelect)="selected = $event.primary"></cn-list>
      <cn-list [items]="details" [dividers]="false" [dense]="true" [metaTemplate]="meta"></cn-list>
    </div>
    <ng-template #meta let-item><cn-badge tone="info" size="small">{{ item.meta }}</cn-badge></ng-template>
    <p class="cs-muted">Selected payee: {{ selected || '-' }}</p>
  </cs-demo-section>
  <cs-demo-section title="Empty">
    <cn-list [items]="[]" emptyText="You have not added any payees"></cn-list>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class ListPageComponent {
  selected = '';
  readonly payees: CnListItem[] = this.fixtures.payees.slice(0, 5).map(p => ({
    id: p.payeeId, primary: p.name, secondary: p.type, icon: 'cn:user'
  }));
  readonly details: CnListItem[] = [
    { id: 'routing', primary: 'Routing number', secondary: '021000000', meta: 'ACH' },
    { id: 'account', primary: 'Account number', secondary: `•••• ${this.fixtures.summaries()[0].last4}`, meta: 'Checking' },
    { id: 'opened', primary: 'Opened', secondary: 'March 2019' }
  ];
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
