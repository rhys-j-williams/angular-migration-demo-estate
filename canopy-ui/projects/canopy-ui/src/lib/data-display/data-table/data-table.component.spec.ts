import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { MatTableHarness } from '@angular/material/table/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnColumn, CnDataTableComponent, CnRowSelection } from './data-table.component';
import { CnDataTableModule } from './data-table.module';

interface Txn {
  id: string;
  postedAt: string;
  description: string;
  amount: number;
  status: string;
}

const ROWS: Txn[] = Array.from({ length: 30 }, (_, i) => ({
  id: `txn-${i + 1}`,
  postedAt: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
  description: `Merchant ${String.fromCharCode(65 + (i % 26))}`,
  amount: (i % 2 === 0 ? -1 : 1) * (i + 1) * 12.34,
  status: i % 5 === 0 ? 'pending' : 'posted'
}));

const COLUMNS: CnColumn<Txn>[] = [
  { key: 'postedAt', header: 'Date', type: 'date' },
  { key: 'description', header: 'Description' },
  { key: 'status', header: 'Status', type: 'status', sortable: false },
  { key: 'amount', header: 'Amount', type: 'currency' }
];

@Component({
  template: `
    <cn-data-table [columns]="columns" [rows]="rows" [pageSize]="10" selectable caption="Transactions"
                   (selectionChange)="selection = $event" (rowClick)="clicked = $event"></cn-data-table>`
})
class HostComponent {
  columns = COLUMNS;
  rows = ROWS;
  selection: CnRowSelection<Txn> | null = null;
  clicked: Txn | null = null;
}

describe('CnDataTableComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnDataTableModule, NoopAnimationsModule],
      declarations: [HostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  function table(): CnDataTableComponent<Txn> {
    return fixture.debugElement.query(d => d.componentInstance instanceof CnDataTableComponent).componentInstance;
  }

  it('renders one page of rows through the Material table harness', async () => {
    const tableHarness = await loader.getHarness(MatTableHarness);
    const rows = await tableHarness.getRows();
    expect(rows.length).toBe(10);
    const headerTexts = await (await tableHarness.getHeaderRows())[0].getCellTextByIndex();
    expect(headerTexts).toEqual(['', 'Date', 'Description', 'Status', 'Amount']);
  });

  it('pages with the paginator harness', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getRangeLabel()).toBe('1 – 10 of 30');
    await paginator.goToNextPage();
    const tableHarness = await loader.getHarness(MatTableHarness);
    const firstCell = await (await tableHarness.getRows())[0].getCellTextByIndex();
    expect(firstCell[1]).toBe('03/11/2024');
  });

  it('sorts by amount through the sort harness', async () => {
    const sort = await loader.getHarness(MatSortHarness);
    const headers = await sort.getSortHeaders({ label: 'Amount' });
    await headers[0].click();
    const tableHarness = await loader.getHarness(MatTableHarness);
    const firstRow = await (await tableHarness.getRows())[0].getCellTextByIndex();
    expect(firstRow[4]).toBe('-$357.86');
  });

  it('formats negative currency cells with the negative class', () => {
    const negative = fixture.nativeElement.querySelectorAll('.cn-cell--negative');
    expect(negative.length).toBe(5);
  });

  it('selects all rows from the header checkbox', () => {
    table().toggleAll();
    fixture.detectChanges();
    expect(host.selection?.all).toBeTrue();
    expect(host.selection?.selected.length).toBe(30);
  });

  it('emits rowClick from keyboard Enter', () => {
    const row: HTMLElement = fixture.nativeElement.querySelector('tr.mat-row');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(host.clicked?.id).toBe('txn-1');
  });

  it('applies the header cell class the density styles rely on', () => {
    const header = fixture.nativeElement.querySelector('th');
    expect(header.classList.contains('mat-header-cell')).toBeTrue();
    expect(fixture.nativeElement.querySelector('td.mat-cell')).toBeTruthy();
  });
});
