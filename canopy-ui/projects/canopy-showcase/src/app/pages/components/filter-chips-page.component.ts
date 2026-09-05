import { Component } from '@angular/core';
import { CnFilterChip } from '@meridian/canopy-ui/data-display';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-filter-chips-page',
  template: `
    <cs-demo-page title="cn-filter-chips" selector="cn-filter-chips" importFrom="data-display" imports="CnFilterChipsModule, CnFilterChip" lede="Selectable chip row for filtering, single or multiple.">

  <cs-demo-section title="Status filter" note="Selectable chips over MatChipList. Counts come from the consumer; the clear chip appears once something is selected.">
    <cn-filter-chips [chips]="status" ariaLabel="Transaction status" (selectionChange)="statusSel = $event"></cn-filter-chips>
    <cn-filter-chips [chips]="channels" [multiple]="true" ariaLabel="Channel" [showCounts]="false" (selectionChange)="channelSel = $event"></cn-filter-chips>
    <pre class="cs-code">status: {{ statusSel | json }}   channels: {{ channelSel | json }}   matching rows: {{ matching }}</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class FilterChipsPageComponent {
  statusSel: string[] = [];
  channelSel: string[] = [];
  private readonly rows = this.fixtures.allTransactions();
  readonly status: CnFilterChip<string>[] = ['posted', 'pending', 'declined', 'reversed'].map(s => ({
    value: s, label: s.charAt(0).toUpperCase() + s.slice(1), count: this.rows.filter(r => r.status === s).length
  }));
  readonly channels: CnFilterChip<string>[] = ['card', 'ach', 'wire', 'atm', 'check', 'internal'].map(c => ({ value: c, label: c.toUpperCase() }));
  get matching(): number {
    return this.rows.filter(r => (!this.statusSel.length || this.statusSel.includes(r.status)) && (!this.channelSel.length || this.channelSel.includes(r.channel))).length;
  }
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
