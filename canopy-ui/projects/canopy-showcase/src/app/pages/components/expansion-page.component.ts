import { Component } from '@angular/core';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-expansion-page',
  template: `
    <cs-demo-page title="cn-expansion" selector="cn-expansion" importFrom="data-display" imports="CnExpansionModule" lede="Single expansion panel with summary line and two-way expanded state.">

  <cs-demo-section title="Transaction detail" note="Wraps a Material expansion panel. summary shows in the header while collapsed.">
    <cn-expansion *ngFor="let t of rows" [title]="t.description" [description]="t.postedAt | date:'mediumDate'" [summary]="t.amount | cnCurrency" icon="cn:card"
                  [expanded]="open === t.id" (expandedChange)="open = $event ? t.id : null">
      <dl class="cs-dl">
        <dt>Category</dt><dd>{{ t.category }}</dd>
        <dt>Channel</dt><dd>{{ t.channel }}</dd>
        <dt>Status</dt><dd><cn-badge [tone]="t.status === 'posted' ? 'success' : 'info'" size="small">{{ t.status }}</cn-badge></dd>
        <dt>Running balance</dt><dd>{{ t.balance | cnCurrency }}</dd>
      </dl>
    </cn-expansion>
    <cn-expansion title="Disabled panel" [disabled]="true" summary="Unavailable"></cn-expansion>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class ExpansionPageComponent {
  open: string | null = null;
  readonly rows = this.fixtures.transactions().slice(0, 4);
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
