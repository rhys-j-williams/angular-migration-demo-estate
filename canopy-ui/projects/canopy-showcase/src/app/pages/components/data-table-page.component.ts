import { Component } from '@angular/core';
import { CnDensity } from '@meridian/canopy-ui/core';
import { CnColumn } from '@meridian/canopy-ui/data-display';
import { CnRadioOption } from '@meridian/canopy-ui/forms';
import { ShowcaseFixturesService, TxnRow } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-data-table-page',
  template: `
    <cs-demo-page title="cn-data-table" selector="cn-data-table" importFrom="data-display" imports="CnDataTableModule, CnColumn" lede="Sortable, pageable, selectable table over an in-memory array.">

  <cs-demo-section title="Transactions" note="Column config drives formatting. Density follows CnConfig unless overridden; comfortable/compact restyle the header, cell and row classes.">
    <div class="cs-row" style="margin-bottom: 12px">
      <cn-radio-group legend="Density" [options]="densities" [(ngModel)]="density" [inline]="true"></cn-radio-group>
      <cn-toggle [(ngModel)]="striped">Striped</cn-toggle>
      <cn-toggle [(ngModel)]="selectable">Selectable</cn-toggle>
      <cn-button variant="tertiary" size="small" (pressed)="reload()">Reload</cn-button>
    </div>
    <cn-data-table [columns]="columns" [rows]="rows" caption="Recent transactions" [density]="density" [striped]="striped" [selectable]="selectable"
                   [loading]="loading" [pageSize]="10" [pageSizeOptions]="[10, 25]" (rowClick)="active = $event" (selectionChange)="selectedCount = $event.selected.length"
                   (sortChange)="lastSort = $event.active + ' ' + $event.direction"></cn-data-table>
    <p class="cs-muted">selected: {{ selectedCount }}   sort: {{ lastSort || '-' }}   active row: {{ active?.description || '-' }}</p>
  </cs-demo-section>
  <cs-demo-section title="Empty state" note="emptyText is what the customer reads. Do not leave it as the default in production.">
    <cn-data-table [columns]="columns" [rows]="[]" caption="No results" emptyText="No transactions match these filters" [showPaginator]="false"></cn-data-table>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class DataTablePageComponent {
  density: CnDensity = 'default';
  striped = false;
  selectable = true;
  loading = false;
  selectedCount = 0;
  lastSort = '';
  active: TxnRow | null = null;
  rows: TxnRow[] = this.fixtures.transactions();
  readonly densities: CnRadioOption<CnDensity>[] = [
    { value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }
  ];
  readonly columns: CnColumn<TxnRow>[] = [
    { key: 'postedAt', header: 'Posted', type: 'date', sortable: true, width: '120px' },
    { key: 'description', header: 'Description', sortable: true, cellClass: 'cn-cell--strong' },
    { key: 'category', header: 'Category' },
    { key: 'channel', header: 'Channel', cellClass: 'cn-cell--muted' },
    { key: 'amount', header: 'Amount', type: 'currency', align: 'end', sortable: true },
    { key: 'status', header: 'Status', type: 'status' }
  ];
  reload(): void {
    this.loading = true;
    this.rows = [];
    setTimeout(() => {
      this.rows = this.fixtures.transactions();
      this.loading = false;
    }, 900);
  }
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
