import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

import { CnDateRange, CnFilterChip } from '@meridian/canopy-ui';

import { TransactionCategory, TransactionQuery } from '../../../../core/api/models';

export type TransactionFilters = Partial<Pick<TransactionQuery, 'from' | 'to' | 'search' | 'category' | 'minAmountMinor' | 'maxAmountMinor'>>;

interface FiltersForm {
  search: FormControl<string>;
  range: FormControl<CnDateRange>;
  category: FormControl<TransactionCategory[]>;
  amountBand: FormControl<string[]>;
}

const AMOUNT_BANDS: Record<string, [number | undefined, number | undefined]> = {
  'lt-25': [undefined, 2500],
  '25-100': [2500, 10000],
  '100-500': [10000, 50000],
  'gt-500': [50000, undefined]
};

/** Search, date range, category chips and amount band. Emits a query fragment, never the query. */
@Component({
  selector: 'mol-transaction-filters',
  templateUrl: './transaction-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFiltersComponent implements OnInit, OnDestroy {
  @Output() readonly changed = new EventEmitter<TransactionFilters>();

  readonly form: FormGroup<FiltersForm> = this.fb.group({
    search: this.fb.control(''),
    range: this.fb.control<CnDateRange>({ start: null, end: null }),
    category: this.fb.control<TransactionCategory[]>([]),
    amountBand: this.fb.control<string[]>([])
  });

  readonly categories: CnFilterChip<TransactionCategory>[] = [
    { value: 'groceries', label: 'Groceries' }, { value: 'dining', label: 'Dining' }, { value: 'fuel', label: 'Fuel' },
    { value: 'travel', label: 'Travel' }, { value: 'utilities', label: 'Utilities' }, { value: 'income', label: 'Income' },
    { value: 'transfers', label: 'Transfers' }, { value: 'fees', label: 'Fees' }
  ];
  readonly bands: CnFilterChip<string>[] = [
    { value: 'lt-25', label: 'Under $25' }, { value: '25-100', label: '$25 to $100' },
    { value: '100-500', label: '$100 to $500' }, { value: 'gt-500', label: 'Over $500' }
  ];

  expanded = false;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    this.form.valueChanges.pipe(debounceTime(250), map(() => this.toFilters()), takeUntil(this.destroy$)).subscribe(f => this.changed.emit(f));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clear(): void {
    this.form.reset();
  }

  get active(): number {
    const v = this.form.getRawValue();
    return [v.search, v.range.start || v.range.end, v.category.length, v.amountBand.length].filter(Boolean).length;
  }

  toFilters(): TransactionFilters {
    const v = this.form.getRawValue();
    const out: TransactionFilters = {};
    if (v.search.trim()) out.search = v.search.trim();
    if (v.range.start) out.from = v.range.start;
    if (v.range.end) out.to = v.range.end;
    if (v.category.length === 1) out.category = v.category[0];
    if (v.amountBand.length === 1) {
      const [min, max] = AMOUNT_BANDS[v.amountBand[0]];
      if (min !== undefined) out.minAmountMinor = min;
      if (max !== undefined) out.maxAmountMinor = max;
    }
    return out;
  }
}
