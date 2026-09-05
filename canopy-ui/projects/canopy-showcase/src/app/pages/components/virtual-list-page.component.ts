import { Component } from '@angular/core';
import { ShowcaseFixturesService, TxnRow } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-virtual-list-page',
  template: `
    <cs-demo-page title="cn-virtual-list" selector="cn-virtual-list" importFrom="data-display" imports="CnVirtualListModule" lede="CDK virtual scroll with keyboard navigation over long transaction histories.">

  <cs-demo-section title="Full history" note="Arrow keys move the active row, Enter activates. reachedEnd fires near the bottom so the consumer can fetch the next page.">
    <cn-virtual-list [items]="rows" [itemHeight]="56" height="420px" ariaLabel="Transaction history" (activate)="opened = $event" (reachedEnd)="loadMore()">
      <ng-template let-row let-active="active">
        <div class="cs-vrow" [class.cs-vrow--active]="active">
          <div>
            <div class="cs-vrow__primary">{{ row.description }}</div>
            <div class="cs-muted">{{ row.postedAt | date:'mediumDate' }} &middot; {{ row.channel }}</div>
          </div>
          <div [class.cs-negative]="row.amount < 0">{{ row.amount | cnCurrency }}</div>
        </div>
      </ng-template>
    </cn-virtual-list>
    <p class="cs-muted">{{ rows.length }} rows loaded, {{ pages }} page(s). Opened: {{ opened?.description || '-' }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class VirtualListPageComponent {
  rows: TxnRow[] = this.fixtures.allTransactions().slice(0, 120);
  pages = 1;
  opened: TxnRow | null = null;
  loadMore(): void {
    const all = this.fixtures.allTransactions();
    if (this.rows.length >= all.length) {
      return;
    }
    this.pages++;
    this.rows = all.slice(0, this.rows.length + 120);
  }
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
