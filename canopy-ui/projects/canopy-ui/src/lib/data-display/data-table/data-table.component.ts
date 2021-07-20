import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, Inject, Input, OnChanges,
  OnDestroy, Output, QueryList, SimpleChanges, TemplateRef, TrackByFunction, ViewChild, ViewEncapsulation
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CN_CONFIG, CnConfig, CnDensity } from '@meridian/canopy-ui/core';
import { CnColumnDefDirective } from './column-def.directive';

export type CnColumnType = 'text' | 'currency' | 'date' | 'number' | 'status' | 'template';
export type CnColumnAlign = 'start' | 'end' | 'center';

export interface CnColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  type?: CnColumnType;
  align?: CnColumnAlign;
  sortable?: boolean;
  width?: string;
  /** Extra classes applied to the cells. `cn-cell--strong`, `cn-cell--muted` are provided. */
  cellClass?: string;
  /** Accessor for nested or derived values. Defaults to `row[key]`. */
  accessor?: (row: T) => unknown;
  /** ISO 4217 code for currency columns; falls back to `row.currency` then config. */
  currency?: string | ((row: T) => string);
}

export interface CnRowSelection<T> {
  selected: T[];
  all: boolean;
}

/**
 * Sortable, pageable, selectable data table over an in-memory array. Columns are configured
 * declaratively; anything the built in cell types cannot render uses a `cnColumnDef` template:
 *
 *   <cn-data-table [columns]="columns" [rows]="transactions" selectable (selectionChange)="onSelect($event)">
 *     <ng-template cnColumnDef="merchant" let-row>
 *       <img [src]="row.merchantLogo" alt="" /> {{ row.merchant }}
 *     </ng-template>
 *   </cn-data-table>
 *
 * Server side paging: set `serverSide`, `totalRows` and listen to `pageChange`/`sortChange`
 * instead of passing the whole array. Density follows CN_CONFIG unless overridden per table.
 * MatTable is not virtualised; paginate anything past a few thousand rows.
 */
@Component({
  selector: 'cn-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cn-data-table',
    '[class.cn-data-table--compact]': 'density === "compact"',
    '[class.cn-data-table--loading]': 'loading',
    '[class.cn-data-table--striped]': 'striped'
  }
})
export class CnDataTableComponent<T extends object = Record<string, unknown>> implements OnChanges, AfterViewInit, OnDestroy {
  @Input() columns: CnColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() caption = '';
  @Input() density: CnDensity;
  @Input()
  get selectable(): boolean {
    return this._selectable;
  }
  set selectable(value: BooleanInput) {
    this._selectable = coerceBooleanProperty(value);
  }
  private _selectable = false;
  @Input() multiSelect = true;
  @Input() striped = false;
  @Input() loading = false;
  @Input() emptyText = 'Nothing to show';
  @Input() pageSize = 25;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showPaginator = true;
  @Input() serverSide = false;
  @Input() totalRows: number | null = null;
  @Input() trackBy: TrackByFunction<T> = (index: number) => index;
  @Input() rowClass: ((row: T) => string) | null = null;
  @Input() locale: string;

  @Output() readonly rowClick = new EventEmitter<T>();
  @Output() readonly selectionChange = new EventEmitter<CnRowSelection<T>>();
  @Output() readonly sortChange = new EventEmitter<Sort>();
  @Output() readonly pageChange = new EventEmitter<PageEvent>();

  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ContentChildren(CnColumnDefDirective) columnDefs?: QueryList<CnColumnDefDirective>;

  readonly dataSource = new MatTableDataSource<T>([]);
  readonly selection = new SelectionModel<T>(true, []);
  private readonly destroy$ = new Subject<void>();
  private readonly defaultCurrency: string;

  constructor(private readonly cdr: ChangeDetectorRef, @Inject(CN_CONFIG) config: CnConfig) {
    this.density = config.density;
    this.locale = config.locale;
    this.defaultCurrency = config.currency;
    this.dataSource.sortingDataAccessor = (row, key) => {
      const column = this.columns.find(c => c.key === key);
      const value = this.cellValue(row, column);
      return typeof value === 'number' ? value : value instanceof Date ? value.getTime() : String(value ?? '').toLowerCase();
    };
  }

  get displayedColumns(): string[] {
    const keys = this.columns.map(c => c.key);
    return this.selectable ? ['__select', ...keys] : keys;
  }

  get resultCount(): number {
    return this.serverSide && this.totalRows !== null ? this.totalRows : this.rows.length;
  }

  get allSelected(): boolean {
    return this.rows.length > 0 && this.selection.selected.length === this.rows.length;
  }

  get someSelected(): boolean {
    return this.selection.hasValue() && !this.allSelected;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.dataSource.data = this.rows;
      this.selection.clear();
    }
    if (changes['multiSelect'] && !this.multiSelect && this.selection.selected.length > 1) {
      const [first] = this.selection.selected;
      this.selection.clear();
      this.selection.select(first);
    }
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(s => {
        this.sortChange.emit(s);
        this.paginator?.firstPage();
      });
      if (!this.serverSide) {
        this.dataSource.sort = this.sort;
      }
    }
    if (this.paginator) {
      this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe(p => this.pageChange.emit(p));
      if (!this.serverSide) {
        this.dataSource.paginator = this.paginator;
      }
    }
    this.selection.changed.pipe(takeUntil(this.destroy$)).subscribe(() =>
      this.selectionChange.emit({ selected: this.selection.selected, all: this.allSelected })
    );
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  templateFor(key: string): TemplateRef<unknown> | null {
    return this.columnDefs?.find(d => d.cnColumnDef === key)?.template ?? null;
  }

  cellValue(row: T, column: CnColumn<T> | undefined): unknown {
    if (!column) {
      return undefined;
    }
    return column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.key];
  }

  numericValue(row: T, column: CnColumn<T>): number | null {
    const value = this.cellValue(row, column);
    return typeof value === 'number' ? value : value === null || value === undefined || value === '' ? null : Number(value);
  }

  dateValue(row: T, column: CnColumn<T>): string | number | Date | null {
    const value = this.cellValue(row, column);
    return typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : null;
  }

  currencyFor(row: T, column: CnColumn<T>): string {
    if (typeof column.currency === 'function') {
      return column.currency(row);
    }
    return column.currency ?? ((row as Record<string, unknown>)['currency'] as string | undefined) ?? this.defaultCurrency;
  }

  cellClasses(row: T, column: CnColumn<T>): string {
    const classes = ['cn-cell', `cn-cell--${column.type ?? 'text'}`, `cn-cell--align-${column.align ?? (this.isNumeric(column) ? 'end' : 'start')}`];
    if (column.cellClass) {
      classes.push(column.cellClass);
    }
    const value = this.cellValue(row, column);
    if (column.type === 'currency' && typeof value === 'number' && value < 0) {
      classes.push('cn-cell--negative');
    }
    return classes.join(' ');
  }

  isNumeric(column: CnColumn<T>): boolean {
    return column.type === 'currency' || column.type === 'number';
  }

  statusClass(value: unknown): string {
    return `cn-status cn-status--${String(value ?? 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  toggleAll(): void {
    this.allSelected ? this.selection.clear() : this.selection.select(...this.rows);
  }

  toggleRow(row: T): void {
    if (!this.multiSelect) {
      this.selection.clear();
    }
    this.selection.toggle(row);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onRowKeydown(event: KeyboardEvent, row: T): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.rowClick.emit(row);
    } else if (event.key === ' ' && this.selectable) {
      event.preventDefault();
      this.toggleRow(row);
    }
  }

  rowClasses(row: T): string {
    const classes: string[] = [];
    if (this.selection.isSelected(row)) {
      classes.push('cn-row--selected');
    }
    if (this.rowClass) {
      classes.push(this.rowClass(row));
    }
    return classes.join(' ');
  }
}
