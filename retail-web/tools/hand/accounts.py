import os
R='/home/ubuntu/repos/angular-migration-demo-estate/retail-web/src/app/features/accounts/components'
def w(p,s):
    os.makedirs(os.path.dirname(p),exist_ok=True); open(p,'w').write(s.lstrip('\n'))

SPEC_HEAD='''import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
'''

# ---------------- account-detail
w(f'{R}/account-detail/account-detail.component.ts', '''
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CnAccountKind, CnAccountSummary } from '@meridian/canopy-ui/data-display';

import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { accountsActions } from '../../store/accounts.actions';

const KIND: Record<AccountDetails['type'], CnAccountKind> = {
  checking: 'checking', savings: 'savings', 'credit-card': 'credit', mortgage: 'loan', 'auto-loan': 'loan',
  certificate: 'investment', 'business-checking': 'business', 'business-savings': 'business', 'treasury-operating': 'business'
};

/**
 * Detail header with balances, routing details, actions and the transaction list.
 *
 * Data arrives through AccountDetailsResolver (route data `details`) so the header never renders
 * in a half loaded state - the old in-component fetch produced a visible balance flash that
 * Accessibility flagged in the 2022 audit (MOL-2588). The transaction list below loads on its own.
 */
@Component({
  selector: 'mol-account-detail',
  templateUrl: './account-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  details$: Observable<AccountDetails> = this.route.data.pipe(map(d => d['details'] as AccountDetails));
  tab = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store,
    private readonly lantern: LanternService
  ) {}

  ngOnInit(): void {
    this.details$.pipe(takeUntil(this.destroy$)).subscribe(d => {
      this.store.dispatch(accountsActions.select({ id: d.accountId }));
      this.lantern.page('account.detail', { accountType: d.type });
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(accountsActions.select({ id: null }));
    this.destroy$.next();
    this.destroy$.complete();
  }

  summary(d: AccountDetails): CnAccountSummary {
    return {
      id: d.accountId,
      nickname: d.nickname,
      kind: KIND[d.type],
      last4: d.accountNumber.slice(-4),
      currency: d.currency,
      currentBalance: d.currentBalanceMinor / 100,
      availableBalance: d.availableBalanceMinor / 100,
      creditLimit: d.creditLimitMinor !== undefined ? d.creditLimitMinor / 100 : undefined,
      status: d.status === 'restricted' ? 'frozen' : d.status === 'dormant' ? 'pending' : d.status
    };
  }

  isLiability(d: AccountDetails): boolean {
    return d.type === 'credit-card' || d.type === 'mortgage' || d.type === 'auto-loan';
  }

  isDeposit(d: AccountDetails): boolean {
    return d.type === 'checking' || d.type === 'savings' || d.type === 'business-checking' || d.type === 'business-savings';
  }

  renamed(): void {
    // Resolver data is a snapshot; re-run the route so the header picks up the new nickname.
    this.store.dispatch(accountsActions.invalidate());
    void this.router.navigate([], { relativeTo: this.route, onSameUrlNavigation: 'reload' });
  }
}
''')
w(f'{R}/account-detail/account-detail.component.html', '''
<ng-container *ngIf="details$ | async as d">
  <cn-page-header [title]="d.nickname" [lede]="d | accountLabel:'short'" backLink="/accounts" backLabel="Accounts" i18n-backLabel="@@accounts.back"
    [breadcrumbs]="[{ label: 'Accounts', link: '/accounts' }, { label: d.nickname }]">
  </cn-page-header>

  <div class="mol-page" fxLayout="column" fxLayoutGap="16px">
    <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px" fxLayoutAlign="start stretch">
      <cn-account-card fxFlex="2 1 0" [account]="summary(d)" [showAvailable]="!isLiability(d)" [allowHideBalance]="true"></cn-account-card>

      <cn-card fxFlex="1 1 0" [padded]="true" title="Details" i18n-title="@@accounts.detail.detailsTitle">
        <dl class="mol-dl">
          <ng-container *ngIf="isLiability(d)">
            <dt i18n="@@accounts.detail.paymentDue">Payment due</dt>
            <dd>{{ d.paymentDueAt | date:'mediumDate' }}</dd>
            <dt i18n="@@accounts.detail.minimumPayment">Minimum payment</dt>
            <dd>{{ d.minimumPaymentMinor | minorAmount }}</dd>
          </ng-container>
          <ng-container *ngIf="d.interestRateBasisPoints !== undefined">
            <dt i18n="@@accounts.detail.rate">Rate</dt>
            <dd>{{ d.interestRateBasisPoints / 100 | number:'1.2-2' }}% {{ isLiability(d) ? 'APR' : 'APY' }}</dd>
          </ng-container>
          <dt i18n="@@accounts.detail.opened">Opened</dt>
          <dd>{{ d.openedAt | date:'MMMM y' }}</dd>
          <dt i18n="@@accounts.detail.statementCycle">Statement cycle</dt>
          <dd i18n="@@accounts.detail.statementCycleValue">Day {{ d.statementCycleDay }} of each month</dd>
          <dt i18n="@@accounts.detail.paperless">Statements</dt>
          <dd>
            <ng-container *ngIf="d.paperlessStatements; else paper" i18n="@@accounts.detail.paperlessOn">Paperless</ng-container>
            <ng-template #paper><span i18n="@@accounts.detail.paperlessOff">By mail</span> <a routerLink="/statements/paperless" i18n="@@accounts.detail.goPaperless">Go paperless</a></ng-template>
          </dd>
        </dl>
        <mol-account-actions-menu [account]="d" (renamed)="renamed()"></mol-account-actions-menu>
      </cn-card>
    </div>

    <mol-routing-details *ngIf="isDeposit(d)" [details]="d"></mol-routing-details>

    <cn-tabs [selectedIndex]="tab" (selectedChange)="tab = $event" ariaLabel="Account activity">
      <ng-template cnTab label="Transactions" i18n-label="@@accounts.detail.tabTransactions">
        <mol-pending-transactions [accountId]="d.accountId"></mol-pending-transactions>
        <mol-transaction-list [accountId]="d.accountId"></mol-transaction-list>
      </ng-template>
      <ng-template cnTab label="Statements" i18n-label="@@accounts.detail.tabStatements">
        <mol-page-section title="Statements" lede="The last 24 months are available online.">
          <a routerLink="/statements" [queryParams]="{ accountId: d.accountId }" class="mol-link" i18n="@@accounts.detail.viewStatements">View statements for this account</a>
        </mol-page-section>
      </ng-template>
      <ng-template cnTab label="Interest" i18n-label="@@accounts.detail.tabInterest" *ngIf="d.interestRateBasisPoints !== undefined">
        <mol-interest-summary></mol-interest-summary>
      </ng-template>
    </cn-tabs>
  </div>
</ng-container>
''')
w(f'{R}/account-detail/account-detail.component.spec.ts', SPEC_HEAD + '''import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { AccountDetailComponent } from './account-detail.component';

const DETAILS: AccountDetails = {
  accountId: 'acc-1', customerId: 'cus-1', type: 'checking', nickname: 'Everyday Checking', accountNumber: '****4411',
  accountNumberFull: '000000004411', routingNumber: '021000000', currency: 'USD', currentBalanceMinor: 152030,
  availableBalanceMinor: 148030, openedAt: '2019-03-04', status: 'open', statementCycleDay: 12, paperlessStatements: true
};

describe('AccountDetailComponent', () => {
  let fixture: ComponentFixture<AccountDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountDetailComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: { data: of({ details: DETAILS }) } },
        { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['page']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDetailComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('maps bank account types onto Canopy account kinds', () => {
    const s = fixture.componentInstance.summary({ ...DETAILS, type: 'credit-card', creditLimitMinor: 500000 });
    expect(s.kind).toBe('credit');
    expect(s.creditLimit).toBe(5000);
    expect(s.last4).toBe('4411');
  });

  it('treats restricted accounts as frozen for display', () => {
    expect(fixture.componentInstance.summary({ ...DETAILS, status: 'restricted' }).status).toBe('frozen');
  });
});
''')

# ---------------- transaction-list
w(f'{R}/transaction-list/transaction-list.component.ts', '''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';

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
''')
w(f'{R}/transaction-list/transaction-list.component.html', '''
<mol-page-section title="Transactions" i18n-title="@@accounts.transactions.title">
  <div molSectionActions fxLayout="row" fxLayoutGap="8px">
    <cn-button variant="tertiary" size="small" icon="download" (pressed)="exportCsv()" i18n="@@accounts.transactions.export">Download</cn-button>
  </div>

  <mol-transaction-filters (changed)="onFilters($event)"></mol-transaction-filters>
  <mol-error-banner [error]="error" (retry)="retry()"></mol-error-banner>

  <cn-data-table
    *ngIf="page$ | async as page"
    [columns]="columns"
    [rows]="page.items"
    [loading]="loading"
    [serverSide]="true"
    [totalRows]="page.total"
    [pageSize]="pageSize"
    [pageSizeOptions]="[pageSize]"
    [showPaginator]="page.total > pageSize"
    [trackBy]="trackById"
    caption="Posted transactions"
    emptyText="No transactions match these filters."
    (rowClick)="open($event)"
    (pageChange)="onPage($event)">
    <ng-template cnColumnDef="description" let-row>
      <div fxLayout="column">
        <span>{{ row.merchantName || row.description }}</span>
        <span class="mol-muted" *ngIf="row.merchantName && row.description !== row.merchantName">{{ row.description }}</span>
      </div>
      <cn-badge *ngIf="row.status === 'disputed'" tone="warn" size="small" i18n="@@txn.status.disputed">Disputed</cn-badge>
      <cn-badge *ngIf="row.status === 'reversed'" tone="neutral" size="small" i18n="@@txn.status.reversed">Reversed</cn-badge>
    </ng-template>
    <ng-template cnColumnDef="amountMinor" let-row>
      <span [class.mol-credit]="row.amountMinor > 0">{{ row.amountMinor | minorAmount:'USD':true }}</span>
    </ng-template>
    <ng-template cnColumnDef="runningBalanceMinor" let-row>
      <span class="mol-muted">{{ row.runningBalanceMinor | minorAmount }}</span>
    </ng-template>
  </cn-data-table>
</mol-page-section>
''')
w(f'{R}/transaction-list/transaction-list.component.spec.ts', SPEC_HEAD + '''import { HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { TransactionListComponent } from './transaction-list.component';

describe('TransactionListComponent', () => {
  let fixture: ComponentFixture<TransactionListComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionListComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: { value: { apiBaseUrl: '/api/v1' } } }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TransactionListComponent);
    fixture.componentInstance.accountId = 'acc-1';
    fixture.componentInstance.ngOnChanges({});
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('requests posted transactions for the account, page 1', fakeAsync(() => {
    tick(200);
    const req = http.expectOne(r => r.url.includes('/accounts/acc-1/transactions'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('status')).toBe('posted');
    req.flush({ items: [], page: 1, pageSize: 25, total: 0 });
  }));

  it('resets to the first page when filters change', fakeAsync(() => {
    tick(200);
    http.expectOne(r => r.url.includes('/transactions')).flush({ items: [], page: 1, pageSize: 25, total: 60 });
    fixture.componentInstance.onPage({ pageIndex: 2, pageSize: 25, length: 60 });
    tick(200);
    expect(http.expectOne(r => r.url.includes('/transactions')).request.params.get('page')).toBe('3');
    fixture.componentInstance.onFilters({ search: 'coffee' });
    tick(200);
    const req = http.expectOne(r => r.url.includes('/transactions'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('search')).toBe('coffee');
    req.flush({ items: [], page: 1, pageSize: 25, total: 0 });
  }));
});
''')

# ---------------- transaction-filters
w(f'{R}/transaction-filters/transaction-filters.component.ts', '''
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
''')
w(f'{R}/transaction-filters/transaction-filters.component.html', '''
<form [formGroup]="form" class="mol-filters" novalidate fxLayout="column" fxLayoutGap="8px">
  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="12px" fxLayoutAlign="start center" fxLayoutAlign.lt-md="stretch">
    <mat-form-field appearance="outline" fxFlex="1 1 0" class="mol-filters__search">
      <mat-label i18n="@@accounts.filters.search">Search description or merchant</mat-label>
      <input matInput formControlName="search" type="search" autocomplete="off" molTrimOnBlur />
      <mat-icon matSuffix aria-hidden="true">search</mat-icon>
    </mat-form-field>
    <cn-date-range formControlName="range" label="Dates" i18n-label="@@accounts.filters.dates" [showPresets]="true" fxFlex="0 0 320px" fxFlex.lt-md="1 1 auto"></cn-date-range>
    <cn-button variant="tertiary" size="small" [icon]="expanded ? 'expand_less' : 'tune'" (pressed)="expanded = !expanded" [attr.aria-expanded]="expanded">
      <span i18n="@@accounts.filters.more">Filters</span><span *ngIf="active"> ({{ active }})</span>
    </cn-button>
    <cn-button *ngIf="active" variant="tertiary" size="small" (pressed)="clear()" i18n="@@accounts.filters.clear">Clear</cn-button>
  </div>
  <div *ngIf="expanded" fxLayout="column" fxLayoutGap="8px">
    <cn-filter-chips formControlName="category" [chips]="categories" [multiple]="true" ariaLabel="Category"></cn-filter-chips>
    <cn-filter-chips formControlName="amountBand" [chips]="bands" [multiple]="false" ariaLabel="Amount"></cn-filter-chips>
  </div>
</form>
''')
w(f'{R}/transaction-filters/transaction-filters.component.spec.ts', SPEC_HEAD + '''
import { SharedModule } from '../../../../shared/shared.module';
import { TransactionFiltersComponent } from './transaction-filters.component';

describe('TransactionFiltersComponent', () => {
  let fixture: ComponentFixture<TransactionFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionFiltersComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionFiltersComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('translates an amount band into minor-unit bounds', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ amountBand: ['25-100'] });
    expect(c.toFilters()).toEqual({ minAmountMinor: 2500, maxAmountMinor: 10000 });
  });

  it('only sends a category when exactly one is selected', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ category: ['dining', 'fuel'] });
    expect(c.toFilters().category).toBeUndefined();
    c.form.patchValue({ category: ['dining'] });
    expect(c.toFilters().category).toBe('dining');
  });

  it('trims search text and drops it when blank', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ search: '   ' });
    expect(c.toFilters().search).toBeUndefined();
    c.form.patchValue({ search: ' coffee ' });
    expect(c.toFilters().search).toBe('coffee');
  });
});
''')

# ---------------- transaction-detail
w(f'{R}/transaction-detail/transaction-detail.component.ts', '''
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Transaction } from '../../../../core/api/models';

const DISPUTE_WINDOW_DAYS = 60;

/** Single transaction with merchant, channel and the dispute entry point. */
@Component({
  selector: 'mol-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailComponent {
  readonly accountId = this.route.snapshot.paramMap.get('accountId') ?? '';
  readonly txn$: Observable<Transaction> = this.route.paramMap.pipe(
    map(p => [p.get('accountId') ?? '', p.get('transactionId') ?? ''] as const),
    switchMap(([accountId, transactionId]) => this.api.transaction(accountId, transactionId))
  );

  constructor(private readonly route: ActivatedRoute, private readonly api: AccountsApiService) {}

  /** Reg E gives 60 days from the statement; we approximate from the posting date. */
  canDispute(t: Transaction, now: Date = new Date()): boolean {
    if (t.status !== 'posted' || t.amountMinor >= 0) return false;
    if (t.channel !== 'card' && t.channel !== 'ach' && t.channel !== 'atm') return false;
    const posted = new Date(t.postedAt).getTime();
    return now.getTime() - posted <= DISPUTE_WINDOW_DAYS * 86_400_000;
  }

  channelLabel(c: Transaction['channel']): string {
    switch (c) {
      case 'card': return 'Card purchase';
      case 'ach': return 'ACH';
      case 'wire': return 'Wire';
      case 'internal': return 'Transfer';
      case 'paylink': return 'PayLink';
      case 'check': return 'Check';
      case 'atm': return 'ATM';
      case 'fee': return 'Fee';
    }
  }
}
''')
w(f'{R}/transaction-detail/transaction-detail.component.html', '''
<ng-container *ngIf="txn$ | async as t; else loading">
  <cn-page-header [title]="t.merchantName || t.description" [eyebrow]="channelLabel(t.channel)" [backLink]="['/accounts', accountId]" backLabel="Back to account" i18n-backLabel="@@accounts.txn.back"></cn-page-header>

  <div class="mol-page" fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px">
    <cn-card fxFlex="1 1 0" [padded]="true">
      <p class="mol-amount" [class.mol-credit]="t.amountMinor > 0">{{ t.amountMinor | minorAmount:'USD':true }}</p>
      <dl class="mol-dl">
        <dt i18n="@@accounts.txn.status">Status</dt>
        <dd>
          <cn-badge [tone]="t.status === 'posted' ? 'success' : t.status === 'pending' ? 'caution' : 'warn'">{{ t.status }}</cn-badge>
        </dd>
        <dt i18n="@@accounts.txn.posted">Posted</dt>
        <dd>{{ t.postedAt | date:'medium' }}</dd>
        <dt *ngIf="t.settledAt" i18n="@@accounts.txn.settled">Settled</dt>
        <dd *ngIf="t.settledAt">{{ t.settledAt | date:'medium' }}</dd>
        <dt i18n="@@accounts.txn.description">Description</dt>
        <dd>{{ t.description }}</dd>
        <dt i18n="@@accounts.txn.category">Category</dt>
        <dd>{{ t.category }}</dd>
        <dt *ngIf="t.merchantCategoryCode" i18n="@@accounts.txn.mcc">Merchant category code</dt>
        <dd *ngIf="t.merchantCategoryCode">{{ t.merchantCategoryCode }}</dd>
        <dt i18n="@@accounts.txn.balanceAfter">Balance after</dt>
        <dd>{{ t.runningBalanceMinor | minorAmount }}</dd>
        <dt i18n="@@accounts.txn.reference">Reference</dt>
        <dd><code>{{ t.transactionId }}</code></dd>
      </dl>
    </cn-card>

    <cn-card fxFlex="0 0 320px" fxFlex.lt-md="1 1 auto" [padded]="true" title="Something not right?" i18n-title="@@accounts.txn.helpTitle">
      <ng-container *ngIf="t.disputeId; else disputeActions">
        <p i18n="@@accounts.txn.disputeOpen">A dispute is already open for this transaction. Reference {{ t.disputeId }}.</p>
        <a routerLink="/messages" class="mol-link" i18n="@@accounts.txn.disputeMessage">Ask about this dispute</a>
      </ng-container>
      <ng-template #disputeActions>
        <p *ngIf="canDispute(t); else noDispute" i18n="@@accounts.txn.disputeIntro">If you do not recognise this charge or the amount is wrong, you can dispute it. We usually credit the amount within two business days while we investigate.</p>
        <ng-template #noDispute><p class="mol-muted" i18n="@@accounts.txn.noDispute">This transaction cannot be disputed online. Call us on the number on the back of your card.</p></ng-template>
        <cn-button *ngIf="canDispute(t)" variant="secondary" [routerLink]="['dispute']" i18n="@@accounts.txn.dispute">Dispute this transaction</cn-button>
      </ng-template>
    </cn-card>
  </div>
</ng-container>
<ng-template #loading><mol-loading-panel [rows]="6"></mol-loading-panel></ng-template>
''')
w(f'{R}/transaction-detail/transaction-detail.component.spec.ts', SPEC_HEAD + '''
import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { Transaction } from '../../../../core/api/models';
import { TransactionDetailComponent } from './transaction-detail.component';

const TXN: Transaction = {
  transactionId: 'txn-1', accountId: 'acc-1', postedAt: '2026-08-30T10:00:00Z', settledAt: null, description: 'POS PURCHASE',
  merchantName: 'Harbor Market', merchantCategoryCode: '5411', category: 'groceries', amountMinor: -4210, runningBalanceMinor: 100000,
  status: 'posted', channel: 'card'
};

describe('TransactionDetailComponent', () => {
  let fixture: ComponentFixture<TransactionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: { value: { apiBaseUrl: '/api/v1' } } }]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionDetailComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('allows a dispute on a recent posted card debit', () => {
    expect(fixture.componentInstance.canDispute(TXN, new Date('2026-09-05'))).toBeTrue();
  });

  it('refuses disputes on credits, pending items and old transactions', () => {
    const c = fixture.componentInstance;
    expect(c.canDispute({ ...TXN, amountMinor: 500 }, new Date('2026-09-05'))).toBeFalse();
    expect(c.canDispute({ ...TXN, status: 'pending' }, new Date('2026-09-05'))).toBeFalse();
    expect(c.canDispute(TXN, new Date('2027-01-05'))).toBeFalse();
    expect(c.canDispute({ ...TXN, channel: 'internal' }, new Date('2026-09-05'))).toBeFalse();
  });
});
''')

# ---------------- account-actions-menu
w(f'{R}/account-actions-menu/account-actions-menu.component.ts', '''
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { CnMenuItem } from '@meridian/canopy-ui/actions';
import { CnDialogService } from '@meridian/canopy-ui/overlays';

import { Account } from '../../../../core/api/models';
import { RenameAccountComponent, RenameAccountData } from '../rename-account/rename-account.component';

/** Overflow menu: rename, transfer from, statements, set as default. */
@Component({
  selector: 'mol-account-actions-menu',
  templateUrl: './account-actions-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountActionsMenuComponent {
  @Input() account!: Account;
  @Output() readonly renamed = new EventEmitter<void>();

  constructor(private readonly router: Router, private readonly dialog: CnDialogService) {}

  get items(): CnMenuItem[] {
    const liability = this.account.type === 'credit-card' || this.account.type === 'mortgage' || this.account.type === 'auto-loan';
    const closed = this.account.status === 'closed';
    return [
      { id: 'rename', label: 'Rename account', icon: 'edit', disabled: closed },
      { id: 'transfer', label: liability ? 'Make a payment' : 'Transfer from this account', icon: 'swap_horiz', disabled: closed || this.account.status === 'restricted' },
      { id: 'statements', label: 'Statements and documents', icon: 'description' },
      { id: 'alerts', label: 'Alerts for this account', icon: 'notifications', dividerBefore: true },
      { id: 'routing', label: 'Direct deposit form', icon: 'download', disabled: liability }
    ];
  }

  select(item: CnMenuItem): void {
    switch (item.id) {
      case 'rename':
        this.dialog
          .open<RenameAccountComponent, RenameAccountData, boolean>(RenameAccountComponent, {
            data: { accountId: this.account.accountId, nickname: this.account.nickname }, size: 'sm'
          })
          .afterClosed()
          .subscribe(ok => { if (ok) this.renamed.emit(); });
        return;
      case 'transfer':
        void this.router.navigate(['/transfers/new'], { queryParams: { from: this.account.accountId } });
        return;
      case 'statements':
        void this.router.navigate(['/statements'], { queryParams: { accountId: this.account.accountId } });
        return;
      case 'alerts':
        void this.router.navigate(['/alerts'], { fragment: this.account.accountId });
        return;
      case 'routing':
        void this.router.navigate(['/statements'], { queryParams: { accountId: this.account.accountId, type: 'notice' } });
        return;
    }
  }
}
''')
w(f'{R}/account-actions-menu/account-actions-menu.component.html', '''
<cn-menu [items]="items" triggerLabel="Account actions" i18n-triggerLabel="@@accounts.actions.trigger" triggerIcon="more_horiz" xPosition="before" (selected)="select($event)"></cn-menu>
''')
w(f'{R}/account-actions-menu/account-actions-menu.component.spec.ts', SPEC_HEAD + '''import { Router } from '@angular/router';

import { SharedModule } from '../../../../shared/shared.module';
import { Account } from '../../../../core/api/models';
import { AccountActionsMenuComponent } from './account-actions-menu.component';

const ACCOUNT: Account = {
  accountId: 'acc-9', customerId: 'cus-1', type: 'credit-card', nickname: 'Rewards Card', accountNumber: '****7788', routingNumber: '021000000',
  currency: 'USD', currentBalanceMinor: -32000, availableBalanceMinor: 468000, openedAt: '2021-01-09', status: 'open', creditLimitMinor: 500000
};

describe('AccountActionsMenuComponent', () => {
  let fixture: ComponentFixture<AccountActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountActionsMenuComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountActionsMenuComponent);
    fixture.componentInstance.account = ACCOUNT;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('offers a payment rather than a transfer on liability accounts', () => {
    const transfer = fixture.componentInstance.items.find(i => i.id === 'transfer');
    expect(transfer?.label).toBe('Make a payment');
    expect(fixture.componentInstance.items.find(i => i.id === 'routing')?.disabled).toBeTrue();
  });

  it('navigates to the transfer wizard with the account preselected', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.componentInstance.select({ id: 'transfer', label: '' });
    expect(spy).toHaveBeenCalledWith(['/transfers/new'], { queryParams: { from: 'acc-9' } });
  });
});
''')

# ---------------- routing-details
w(f'{R}/routing-details/routing-details.component.ts', '''
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';

/**
 * Reveals routing and full account number for direct deposit forms. The full number is only on
 * the details endpoint and only shown after an explicit click (GIS-1471 finding 2); it is never
 * written to analytics or logs.
 */
@Component({
  selector: 'mol-routing-details',
  templateUrl: './routing-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutingDetailsComponent {
  @Input() details!: AccountDetails;
  revealed = false;

  constructor(private readonly clipboard: Clipboard, private readonly toast: CnToastService, private readonly lantern: LanternService) {}

  toggle(): void {
    this.revealed = !this.revealed;
    if (this.revealed) this.lantern.track('account.number.revealed', { accountType: this.details.type });
  }

  copy(kind: 'routing' | 'account'): void {
    const value = kind === 'routing' ? this.details.routingNumber : this.details.accountNumberFull;
    if (this.clipboard.copy(value)) {
      this.toast.success(kind === 'routing' ? $localize`:@@accounts.routing.copiedRouting:Routing number copied` : $localize`:@@accounts.routing.copiedAccount:Account number copied`);
    }
  }

  get maskedFull(): string {
    const full = this.details.accountNumberFull;
    return full.slice(0, -4).replace(/./g, '\\u2022') + full.slice(-4);
  }
}
''')
w(f'{R}/routing-details/routing-details.component.html', '''
<cn-expansion title="Account and routing numbers" i18n-title="@@accounts.routing.title" description="For direct deposit and automatic payments" i18n-description="@@accounts.routing.description" icon="account_balance">
  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="24px" fxLayoutGap.lt-md="12px">
    <div fxLayout="column">
      <span class="mol-muted" i18n="@@accounts.routing.routingLabel">Routing number (ACH and wire)</span>
      <span fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="4px">
        <code class="mol-number">{{ details.routingNumber }}</code>
        <cn-icon-button icon="content_copy" size="small" ariaLabel="Copy routing number" i18n-ariaLabel="@@accounts.routing.copyRouting" (pressed)="copy('routing')"></cn-icon-button>
      </span>
    </div>
    <div fxLayout="column">
      <span class="mol-muted" i18n="@@accounts.routing.accountLabel">Account number</span>
      <span fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="4px">
        <code class="mol-number" [attr.aria-live]="'polite'">{{ revealed ? details.accountNumberFull : maskedFull }}</code>
        <cn-icon-button [icon]="revealed ? 'visibility_off' : 'visibility'" size="small" [ariaLabel]="revealed ? 'Hide account number' : 'Show account number'" (pressed)="toggle()"></cn-icon-button>
        <cn-icon-button *ngIf="revealed" icon="content_copy" size="small" ariaLabel="Copy account number" i18n-ariaLabel="@@accounts.routing.copyAccount" (pressed)="copy('account')"></cn-icon-button>
      </span>
    </div>
  </div>
  <p class="mol-muted mol-small" i18n="@@accounts.routing.note">Use the routing number above for both electronic transfers and wires. Meridian Trust Bank does not use a separate wire routing number.</p>
</cn-expansion>
''')
w(f'{R}/routing-details/routing-details.component.spec.ts', SPEC_HEAD + '''import { Clipboard } from '@angular/cdk/clipboard';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { RoutingDetailsComponent } from './routing-details.component';

const DETAILS: AccountDetails = {
  accountId: 'acc-1', customerId: 'cus-1', type: 'checking', nickname: 'Everyday', accountNumber: '****4411', accountNumberFull: '000000004411',
  routingNumber: '021000000', currency: 'USD', currentBalanceMinor: 1, availableBalanceMinor: 1, openedAt: '2019-03-04', status: 'open',
  statementCycleDay: 12, paperlessStatements: true
};

describe('RoutingDetailsComponent', () => {
  let fixture: ComponentFixture<RoutingDetailsComponent>;
  let lantern: jasmine.SpyObj<LanternService>;

  beforeEach(async () => {
    lantern = jasmine.createSpyObj<LanternService>('LanternService', ['track']);
    await TestBed.configureTestingModule({
      declarations: [RoutingDetailsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: LanternService, useValue: lantern }]
    }).compileComponents();

    fixture = TestBed.createComponent(RoutingDetailsComponent);
    fixture.componentInstance.details = DETAILS;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('masks everything but the last four until revealed', () => {
    expect(fixture.componentInstance.maskedFull.endsWith('4411')).toBeTrue();
    expect(fixture.componentInstance.maskedFull).not.toContain('0000');
  });

  it('tracks a reveal without sending the number', () => {
    fixture.componentInstance.toggle();
    expect(lantern.track).toHaveBeenCalledWith('account.number.revealed', { accountType: 'checking' });
    const args = JSON.stringify(lantern.track.calls.mostRecent().args);
    expect(args).not.toContain('4411');
  });

  it('copies the routing number to the clipboard', () => {
    const clipboard = TestBed.inject(Clipboard);
    const spy = spyOn(clipboard, 'copy').and.returnValue(true);
    fixture.componentInstance.copy('routing');
    expect(spy).toHaveBeenCalledWith('021000000');
  });
});
''')

# ---------------- pending-transactions
w(f'{R}/pending-transactions/pending-transactions.component.ts', '''
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Transaction } from '../../../../core/api/models';

/** Pending card authorisations shown above posted transactions. Collapsed by default past three. */
@Component({
  selector: 'mol-pending-transactions',
  templateUrl: './pending-transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingTransactionsComponent implements OnChanges {
  @Input() accountId!: string;
  pending$: Observable<Transaction[]> = of([]);
  showAll = false;

  constructor(private readonly api: AccountsApiService) {}

  ngOnChanges(): void {
    this.showAll = false;
    this.pending$ = this.api.transactions({ accountId: this.accountId, status: 'pending', page: 1, pageSize: 50 }).pipe(
      map(p => p.items),
      catchError(() => of([] as Transaction[]))
    );
  }

  visible(rows: Transaction[]): Transaction[] {
    return this.showAll ? rows : rows.slice(0, 3);
  }

  total(rows: Transaction[]): number {
    return rows.reduce((sum, t) => sum + t.amountMinor, 0);
  }
}
''')
w(f'{R}/pending-transactions/pending-transactions.component.html', '''
<ng-container *ngIf="pending$ | async as rows">
  <mol-page-section *ngIf="rows.length" title="Pending" i18n-title="@@accounts.pending.title" [lede]="'Holds and authorisations that have not posted yet. ' + (total(rows) | minorAmount:'USD':true) + ' in total.'">
    <ul class="mol-pending">
      <li *ngFor="let t of visible(rows)" fxLayout="row" fxLayoutAlign="space-between center" fxLayoutGap="12px">
        <span fxFlex>{{ t.merchantName || t.description }}</span>
        <span class="mol-muted">{{ t.postedAt | relativeDate }}</span>
        <span>{{ t.amountMinor | minorAmount:'USD':true }}</span>
      </li>
    </ul>
    <cn-button *ngIf="rows.length > 3" variant="tertiary" size="small" (pressed)="showAll = !showAll">
      <ng-container *ngIf="showAll; else more" i18n="@@accounts.pending.less">Show fewer</ng-container>
      <ng-template #more><span i18n="@@accounts.pending.more">Show all {{ rows.length }}</span></ng-template>
    </cn-button>
  </mol-page-section>
</ng-container>
''')
w(f'{R}/pending-transactions/pending-transactions.component.spec.ts', SPEC_HEAD + '''
import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { Transaction } from '../../../../core/api/models';
import { PendingTransactionsComponent } from './pending-transactions.component';

function txn(id: string, amountMinor: number): Transaction {
  return { transactionId: id, accountId: 'a', postedAt: '2026-09-01T00:00:00Z', settledAt: null, description: id, merchantName: '', merchantCategoryCode: '',
    category: 'dining', amountMinor, runningBalanceMinor: 0, status: 'pending', channel: 'card' };
}

describe('PendingTransactionsComponent', () => {
  let fixture: ComponentFixture<PendingTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingTransactionsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: { value: { apiBaseUrl: '/api/v1' } } }]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingTransactionsComponent);
    fixture.componentInstance.accountId = 'acc-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows three rows until expanded', () => {
    const rows = [txn('1', -100), txn('2', -200), txn('3', -300), txn('4', -400)];
    const c = fixture.componentInstance;
    expect(c.visible(rows).length).toBe(3);
    c.showAll = true;
    expect(c.visible(rows).length).toBe(4);
    expect(c.total(rows)).toBe(-1000);
  });
});
''')
