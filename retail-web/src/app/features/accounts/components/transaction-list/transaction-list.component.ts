import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CnColumn } from '@meridian/canopy-ui/data-display';
import { CnDialogService } from '@meridian/canopy-ui/overlays';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Page, Transaction, TransactionQuery } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { ExportTransactionsComponent } from '../export-transactions/export-transactions.component';
import { TransactionFilters } from '../transaction-filters/transaction-filters.component';

const PAGE_SIZE = 25;

/**
 * Filterable, paged transaction list for one account. Server-side paging: the BFF caps a page at
 * 200 and customers with 15 years of history exist (MOL-1104). Filters debounce so typing in the
 * search box does not fan out a request per keystroke.
 */
@Component({
  selector: 'mol-transaction-list',
  templateUrl: './transaction-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() accountId!: string;

  readonly columns: CnColumn<Transaction>[] = [
    { key: 'postedAt', header: 'Date', type: 'date', width: '120px', sortable: true },
    { key: 'description', header: 'Description', type: 'template' },
    { key: 'category', header: 'Category', type: 'text', width: '140px' },
    { key: 'amountMinor', header: 'Amount', type: 'template', align: 'end', width: '140px' },
    { key: 'runningBalanceMinor', header: 'Balance', type: 'template', align: 'end', width: '140px' }
  ];

  page$!: Observable<Page<Transaction>>;
  loading = false;
  error: AppError | null = null;

  private readonly query$ = new BehaviorSubject<TransactionQuery | null>(null);
  private filters: TransactionFilters = {};
  private pageIndex = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly api: AccountsApiService,
    private readonly router: Router,
    private readonly dialog: CnDialogService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.page$ = this.query$.pipe(
      debounceTime(150),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => { this.loading = true; this.error = null; this.cdr.markForCheck(); }),
      switchMap(q => this.api.transactions(q ?? this.buildQuery())),
      tap({
        next: () => { this.loading = false; this.cdr.markForCheck(); },
        error: (err: AppError) => { this.loading = false; this.error = err; this.cdr.markForCheck(); }
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountId'] && !changes['accountId'].firstChange) {
      this.pageIndex = 0;
      this.filters = {};
    }
    this.query$.next(this.buildQuery());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilters(filters: TransactionFilters): void {
    this.filters = filters;
    this.pageIndex = 0;
    this.query$.next(this.buildQuery());
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.query$.next(this.buildQuery());
  }

  retry(): void {
    this.query$.next({ ...this.buildQuery() });
  }

  open(row: Transaction): void {
    void this.router.navigate(['/accounts', this.accountId, 'transactions', row.transactionId]);
  }

  exportCsv(): void {
    this.dialog.open(ExportTransactionsComponent, { data: { accountId: this.accountId, from: this.filters.from, to: this.filters.to }, size: 'sm' });
  }

  trackById(_: number, row: Transaction): string {
    return row.transactionId;
  }

  get pageSize(): number {
    return PAGE_SIZE;
  }

  private buildQuery(): TransactionQuery {
    return {
      accountId: this.accountId,
      page: this.pageIndex + 1,
      pageSize: PAGE_SIZE,
      status: 'posted',
      ...this.filters
    };
  }
}
