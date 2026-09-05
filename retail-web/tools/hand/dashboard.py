import os
R='/home/ubuntu/repos/angular-migration-demo-estate/retail-web/src/app/features/dashboard/components'
def w(p,s):
    os.makedirs(os.path.dirname(p),exist_ok=True); open(p,'w').write(s.lstrip('\n'))

# ---------------- dashboard-overview
w(f'{R}/dashboard-overview/dashboard-overview.component.ts', '''
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { FeatureFlagService } from '../../../../core/flags/feature-flag.service';
import { selectGreetingName } from '../../../../core/store/session';

/** Composes the dashboard tiles; owns the greeting and the tile layout. */
@Component({
  selector: 'mol-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent {
  readonly greeting$ = this.store.select(selectGreetingName).pipe(map(name => this.greeting(name)));
  readonly showPromo$ = this.flags.isEnabled$('mol.dashboard.promo');
  readonly showSpending$ = this.flags.isEnabled$('mol.dashboard.spending-snapshot');

  constructor(private readonly store: Store, private readonly flags: FeatureFlagService) {}

  private greeting(name: string | null, now: Date = new Date()): string {
    const h = now.getHours();
    const part = h < 12 ? $localize`:@@dashboard.greeting.morning:Good morning` : h < 18 ? $localize`:@@dashboard.greeting.afternoon:Good afternoon` : $localize`:@@dashboard.greeting.evening:Good evening`;
    return name ? `${part}, ${name}` : part;
  }
}
''')
w(f'{R}/dashboard-overview/dashboard-overview.component.html', '''
<cn-page-header [title]="(greeting$ | async) ?? ''" lede="Here is where things stand today." i18n-lede="@@dashboard.lede"></cn-page-header>

<div class="mol-page mol-dashboard" fxLayout="column" fxLayoutGap="16px">
  <mol-promo-banner *ngIf="showPromo$ | async"></mol-promo-banner>

  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px" fxLayoutAlign="start stretch">
    <div fxFlex="7 1 0" fxFlex.lt-md="1 1 auto" fxLayout="column" fxLayoutGap="16px">
      <mol-accounts-summary [limit]="5"></mol-accounts-summary>
      <mol-recent-activity></mol-recent-activity>
    </div>
    <div fxFlex="5 1 0" fxFlex.lt-md="1 1 auto" fxLayout="column" fxLayoutGap="16px">
      <mol-quick-transfer></mol-quick-transfer>
      <mol-upcoming-payments></mol-upcoming-payments>
      <mol-alerts-digest></mol-alerts-digest>
      <mol-spending-snapshot *ngIf="showSpending$ | async"></mol-spending-snapshot>
    </div>
  </div>
</div>
''')
w(f'{R}/dashboard-overview/dashboard-overview.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SharedModule } from '../../../../shared/shared.module';
import { FeatureFlagService } from '../../../../core/flags/feature-flag.service';
import { sessionFeatureKey } from '../../../../core/store/session';
import { DashboardOverviewComponent } from './dashboard-overview.component';

describe('DashboardOverviewComponent', () => {
  let fixture: ComponentFixture<DashboardOverviewComponent>;

  beforeEach(async () => {
    const flags = jasmine.createSpyObj<FeatureFlagService>('FeatureFlagService', ['isEnabled$']);
    flags.isEnabled$.and.returnValue(of(false));
    await TestBed.configureTestingModule({
      declarations: [DashboardOverviewComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { [sessionFeatureKey]: { profile: { firstName: 'Dana' } } } }),
        { provide: FeatureFlagService, useValue: flags }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOverviewComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('greets the customer by first name', () => {
    const header = fixture.nativeElement.querySelector('cn-page-header') as HTMLElement;
    expect(header.getAttribute('ng-reflect-title')).toContain('Dana');
  });
});
''')

# ---------------- recent-activity
w(f'{R}/recent-activity/recent-activity.component.ts', '''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { Account, Transaction } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { dashboardSelectors } from '../../store/dashboard.selectors';

interface ActivityRow {
  transaction: Transaction;
  account: Account;
}

/**
 * Last ten transactions across all accounts. The BFF has no cross-account endpoint (PLAT-2210 has
 * been open since 2022) so we fan out one page per deposit account and merge client side. Kept
 * to deposit accounts on purpose: credit card activity on the dashboard confused people (MOL-2919).
 */
@Component({
  selector: 'mol-recent-activity',
  templateUrl: './recent-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentActivityComponent implements OnInit {
  rows$!: Observable<ActivityRow[] | null>;
  error: AppError | null = null;

  constructor(private readonly store: Store, private readonly api: AccountsApiService) {}

  ngOnInit(): void {
    this.rows$ = this.store.select(dashboardSelectors.selectLoadedAt).pipe(
      filter((at): at is number => at !== null),
      take(1),
      switchMap(() => this.store.select(dashboardSelectors.selectAll).pipe(take(1))),
      switchMap(accounts => {
        const deposit = accounts.filter(a => a.type === 'checking' || a.type === 'savings').slice(0, 4);
        if (!deposit.length) return of([]);
        return combineLatest(
          deposit.map(a =>
            this.api.transactions({ accountId: a.accountId, page: 1, pageSize: 5 }).pipe(
              map(page => page.items.map(transaction => ({ transaction, account: a }))),
              catchError(() => of([] as ActivityRow[]))
            )
          )
        ).pipe(
          map(groups => groups.flat().sort((x, y) => y.transaction.postedAt.localeCompare(x.transaction.postedAt)).slice(0, 10))
        );
      })
    );
  }

  trackByTxn(_: number, row: ActivityRow): string {
    return row.transaction.transactionId;
  }
}
''')
w(f'{R}/recent-activity/recent-activity.component.html', '''
<cn-card title="Recent activity" i18n-title="@@dashboard.recentActivity.title" [padded]="false" class="mol-widget">
  <ng-container *ngIf="rows$ | async as rows; else loading">
    <ul class="mol-activity" *ngIf="rows.length; else empty">
      <li *ngFor="let row of rows; trackBy: trackByTxn" class="mol-activity__row" fxLayout="row" fxLayoutAlign="space-between center" fxLayoutGap="12px"
          [routerLink]="['/accounts', row.account.accountId, 'transactions', row.transaction.transactionId]">
        <div fxFlex fxLayout="column">
          <span class="mol-activity__desc">{{ row.transaction.merchantName || row.transaction.description }}</span>
          <span class="mol-muted">{{ row.account | accountLabel:'short' }} &middot; {{ row.transaction.postedAt | relativeDate }}</span>
        </div>
        <span class="mol-activity__amount" [class.mol-credit]="row.transaction.amountMinor > 0">
          {{ row.transaction.amountMinor | minorAmount:'USD':true }}
        </span>
        <cn-badge *ngIf="row.transaction.status === 'pending'" tone="caution" size="small" i18n="@@txn.status.pending">Pending</cn-badge>
      </li>
    </ul>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="5"></mol-loading-panel></ng-template>
  <ng-template #empty>
    <mol-empty-state icon="receipt_long" title="No activity yet" i18n-title="@@dashboard.recentActivity.empty"
      body="Transactions show here as soon as they post to a checking or savings account." i18n-body="@@dashboard.recentActivity.emptyBody"></mol-empty-state>
  </ng-template>
</cn-card>
''')
w(f'{R}/recent-activity/recent-activity.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { dashboardFeatureKey } from '../../store/dashboard.reducer';
import { RecentActivityComponent } from './recent-activity.component';

describe('RecentActivityComponent', () => {
  let fixture: ComponentFixture<RecentActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecentActivityComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [dashboardFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivityComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the skeleton until accounts have loaded', () => {
    expect(fixture.nativeElement.querySelector('mol-loading-panel')).toBeTruthy();
  });
});
''')

# ---------------- quick-transfer
w(f'{R}/quick-transfer/quick-transfer.component.ts', '''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Account } from '../../../../core/api/models';
import { ConfigService } from '../../../../core/config/config.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { dashboardActions } from '../../store/dashboard.actions';
import { dashboardSelectors } from '../../store/dashboard.selectors';

interface QuickTransferForm {
  from: FormControl<string>;
  to: FormControl<string>;
  amountMinor: FormControl<number | null>;
}

/**
 * One-step transfer between the customer's own accounts. Deliberately capped below the MFA
 * step-up threshold: anything at or above it is pushed into the full wizard where the guard
 * lives. Do not raise the cap here without talking to Payments Risk (PR-2021-014).
 */
@Component({
  selector: 'mol-quick-transfer',
  templateUrl: './quick-transfer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickTransferComponent implements OnInit, OnDestroy {
  readonly form: FormGroup<QuickTransferForm> = this.fb.group({
    from: this.fb.control('', Validators.required),
    to: this.fb.control('', Validators.required),
    amountMinor: this.fb.control<number | null>(null, [Validators.required, Validators.min(100)])
  });

  options$!: Observable<CnSelectOption<string>[]>;
  busy = false;
  error: AppError | null = null;
  readonly capMinor = this.config.value.transfers.mfaStepUpThresholdMinor - 1;

  private accounts: Account[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly store: Store,
    private readonly api: TransfersApiService,
    private readonly config: ConfigService,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eligible$ = this.store.select(dashboardSelectors.selectAll).pipe(
      map(all => all.filter(a => (a.type === 'checking' || a.type === 'savings') && a.status === 'open'))
    );
    eligible$.pipe(takeUntil(this.destroy$)).subscribe(list => (this.accounts = list));
    this.options$ = eligible$.pipe(
      map(list => list.map(a => ({ value: a.accountId, label: `${a.nickname} (${a.accountNumber.slice(-4)})`, description: this.available(a) })))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get sameAccount(): boolean {
    const { from, to } = this.form.getRawValue();
    return !!from && from === to;
  }

  get overCap(): boolean {
    return (this.form.controls.amountMinor.value ?? 0) > this.capMinor;
  }

  get insufficient(): boolean {
    const { from, amountMinor } = this.form.getRawValue();
    const src = this.accounts.find(a => a.accountId === from);
    return !!src && (amountMinor ?? 0) > src.availableBalanceMinor;
  }

  submit(): void {
    if (this.form.invalid || this.sameAccount || this.insufficient) {
      this.form.markAllAsTouched();
      return;
    }
    const { from, to, amountMinor } = this.form.getRawValue();
    if (this.overCap) {
      // Hand off to the wizard with the fields pre-filled; the review step's guard handles MFA.
      void this.router.navigate(['/transfers/new'], { queryParams: { from, to, amountMinor } });
      return;
    }
    this.busy = true;
    this.error = null;
    this.api
      .submit({
        type: 'internal',
        fromAccountId: from,
        toAccountId: to,
        amountMinor: amountMinor ?? 0,
        scheduledFor: new Date().toISOString().slice(0, 10),
        frequency: 'once',
        idempotencyKey: crypto.randomUUID()
      })
      .subscribe({
        next: t => {
          this.busy = false;
          this.lantern.track('dashboard.quick_transfer.submitted', { status: t.status });
          this.toast.success($localize`:@@dashboard.quickTransfer.done:Transfer ${t.confirmationNumber}:confirmation: submitted`);
          this.form.reset();
          this.store.dispatch(dashboardActions.invalidate());
          this.store.dispatch(dashboardActions.load());
          this.cdr.markForCheck();
        },
        error: (err: AppError) => {
          this.busy = false;
          this.error = err;
          this.cdr.markForCheck();
        }
      });
  }

  private available(a: Account): string {
    return $localize`:@@dashboard.quickTransfer.available:Available ${(a.availableBalanceMinor / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}:amount:`;
  }
}
''')
w(f'{R}/quick-transfer/quick-transfer.component.html', '''
<cn-card title="Quick transfer" i18n-title="@@dashboard.quickTransfer.title" subtitle="Between your own accounts, today" i18n-subtitle="@@dashboard.quickTransfer.subtitle" class="mol-widget">
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate fxLayout="column" fxLayoutGap="8px">
    <mol-error-banner [error]="error" [showRetry]="false"></mol-error-banner>

    <cn-select formControlName="from" label="From" i18n-label="@@transfer.from" [options]="(options$ | async) ?? []" [required]="true"></cn-select>
    <cn-select formControlName="to" label="To" i18n-label="@@transfer.to" [options]="(options$ | async) ?? []" [required]="true"
      [errorText]="sameAccount ? 'Choose a different account' : null"></cn-select>

    <mat-form-field appearance="outline">
      <mat-label i18n="@@transfer.amount">Amount</mat-label>
      <cn-currency-input formControlName="amountMinor" [min]="100" [allowNegative]="false"></cn-currency-input>
      <mat-hint *ngIf="insufficient" class="mol-warn" i18n="@@transfer.insufficient">That is more than the available balance.</mat-hint>
      <mat-hint *ngIf="!insufficient && overCap" i18n="@@dashboard.quickTransfer.overCap">Larger transfers continue in the full transfer flow.</mat-hint>
    </mat-form-field>

    <div fxLayout="row" fxLayoutAlign="end center" fxLayoutGap="8px">
      <a routerLink="/transfers/new" class="mol-link" i18n="@@dashboard.quickTransfer.more">More options</a>
      <cn-button type="submit" variant="primary" [loading]="busy" [disabled]="form.invalid || sameAccount || insufficient">
        <ng-container *ngIf="overCap; else plain" i18n="@@action.continue">Continue</ng-container>
        <ng-template #plain><span i18n="@@action.transfer">Transfer</span></ng-template>
      </cn-button>
    </div>
  </form>
</cn-card>
''')
w(f'{R}/quick-transfer/quick-transfer.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { dashboardFeatureKey } from '../../store/dashboard.reducer';
import { QuickTransferComponent } from './quick-transfer.component';

describe('QuickTransferComponent', () => {
  let fixture: ComponentFixture<QuickTransferComponent>;

  beforeEach(async () => {
    const config = { value: { transfers: { mfaStepUpThresholdMinor: 250000 } } };
    await TestBed.configureTestingModule({
      declarations: [QuickTransferComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({
          initialState: {
            [dashboardFeatureKey]: {
              ids: ['a1', 'a2'],
              entities: {
                a1: { accountId: 'a1', type: 'checking', status: 'open', nickname: 'Everyday', accountNumber: '****1234', availableBalanceMinor: 50000 },
                a2: { accountId: 'a2', type: 'savings', status: 'open', nickname: 'Rainy day', accountNumber: '****9876', availableBalanceMinor: 900000 }
              },
              loading: false, error: null, selectedId: null, loadedAt: 1
            }
          }
        }),
        { provide: ConfigService, useValue: config },
        { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickTransferComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('refuses a transfer to the same account', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ from: 'a1', to: 'a1', amountMinor: 1000 });
    expect(c.sameAccount).toBeTrue();
  });

  it('flags amounts above available balance', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ from: 'a1', to: 'a2', amountMinor: 60000 });
    expect(c.insufficient).toBeTrue();
  });

  it('routes amounts at or above the MFA threshold into the wizard', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ from: 'a2', to: 'a1', amountMinor: 250000 });
    expect(c.overCap).toBeTrue();
  });
});
''')

# ---------------- spending-snapshot
w(f'{R}/spending-snapshot/spending-snapshot.component.ts', '''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { TransactionCategory } from '../../../../core/api/models';
import { dashboardSelectors } from '../../store/dashboard.selectors';

export interface SpendSlice {
  category: TransactionCategory;
  label: string;
  minor: number;
  share: number;
  colour: string;
}

const LABELS: Partial<Record<TransactionCategory, string>> = {
  groceries: 'Groceries', dining: 'Dining', fuel: 'Fuel', travel: 'Travel', utilities: 'Utilities',
  healthcare: 'Healthcare', entertainment: 'Entertainment', insurance: 'Insurance',
  'home-improvement': 'Home', education: 'Education', charity: 'Giving', fees: 'Fees', taxes: 'Taxes'
};
const PALETTE = ['#1f5f8b', '#2e8b57', '#c98a1b', '#8b3a62', '#5f6f8b', '#b8562e'];

/**
 * Spend by category for the current calendar month, primary checking account only. Drawn as a
 * conic-gradient doughnut in CSS rather than a chart library: Canopy has no chart component and
 * we were told not to add a third one (CNPY-1780). Excludes transfers and income.
 */
@Component({
  selector: 'mol-spending-snapshot',
  templateUrl: './spending-snapshot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingSnapshotComponent implements OnInit {
  slices$!: Observable<SpendSlice[] | null>;
  total = 0;

  constructor(private readonly store: Store, private readonly api: AccountsApiService) {}

  ngOnInit(): void {
    const monthStart = new Date();
    monthStart.setDate(1);
    this.slices$ = this.store.select(dashboardSelectors.selectAll).pipe(
      map(all => all.find(a => a.type === 'checking')),
      filter(a => a !== undefined),
      take(1),
      switchMap(a =>
        this.api.transactions({ accountId: a!.accountId, from: monthStart.toISOString().slice(0, 10), page: 1, pageSize: 200 }).pipe(
          map(page => this.aggregate(page.items.filter(t => t.amountMinor < 0 && t.category !== 'transfers').map(t => [t.category, -t.amountMinor] as const))),
          catchError(() => of([] as SpendSlice[]))
        )
      )
    );
  }

  gradient(slices: SpendSlice[]): string {
    let acc = 0;
    const stops = slices.map(s => {
      const from = acc;
      acc += s.share;
      return `${s.colour} ${from}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  private aggregate(rows: readonly (readonly [TransactionCategory, number])[]): SpendSlice[] {
    const totals = new Map<TransactionCategory, number>();
    for (const [cat, minor] of rows) totals.set(cat, (totals.get(cat) ?? 0) + minor);
    this.total = [...totals.values()].reduce((a, b) => a + b, 0);
    const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const rest = this.total - top.reduce((a, [, v]) => a + v, 0);
    const out: SpendSlice[] = top.map(([category, minor], i) => ({
      category, minor, label: LABELS[category] ?? category, share: this.total ? Math.round((minor / this.total) * 100) : 0, colour: PALETTE[i]
    }));
    if (rest > 0) out.push({ category: 'fees', label: 'Everything else', minor: rest, share: Math.round((rest / this.total) * 100), colour: PALETTE[5] });
    return out;
  }
}
''')
w(f'{R}/spending-snapshot/spending-snapshot.component.html', '''
<cn-card title="Spending this month" i18n-title="@@dashboard.spending.title" class="mol-widget">
  <ng-container *ngIf="slices$ | async as slices; else loading">
    <div *ngIf="slices.length; else empty" fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px" fxLayoutAlign="start center">
      <div class="mol-doughnut" role="img" [attr.aria-label]="'Spending by category, total ' + (total | minorAmount)" [style.background]="gradient(slices)">
        <div class="mol-doughnut__hole">
          <span class="mol-doughnut__total">{{ total | minorAmount }}</span>
        </div>
      </div>
      <ul class="mol-legend" fxFlex>
        <li *ngFor="let s of slices" fxLayout="row" fxLayoutAlign="space-between center">
          <span><i class="mol-legend__swatch" [style.background]="s.colour"></i>{{ s.label }}</span>
          <span class="mol-muted">{{ s.minor | minorAmount }} &middot; {{ s.share }}%</span>
        </li>
      </ul>
    </div>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="3"></mol-loading-panel></ng-template>
  <ng-template #empty>
    <mol-empty-state icon="donut_small" title="Nothing to chart yet" i18n-title="@@dashboard.spending.empty" body="Card and bill payments from your checking account will appear here as the month goes on." i18n-body="@@dashboard.spending.emptyBody"></mol-empty-state>
  </ng-template>
</cn-card>
''')
w(f'{R}/spending-snapshot/spending-snapshot.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { dashboardFeatureKey } from '../../store/dashboard.reducer';
import { SpendingSnapshotComponent } from './spending-snapshot.component';

describe('SpendingSnapshotComponent', () => {
  let fixture: ComponentFixture<SpendingSnapshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpendingSnapshotComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [dashboardFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(SpendingSnapshotComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('builds a conic gradient whose stops add up to the slice shares', () => {
    const css = fixture.componentInstance.gradient([
      { category: 'groceries', label: 'Groceries', minor: 6000, share: 60, colour: '#111' },
      { category: 'fuel', label: 'Fuel', minor: 4000, share: 40, colour: '#222' }
    ]);
    expect(css).toBe('conic-gradient(#111 0% 60%, #222 60% 100%)');
  });
});
''')

# ---------------- upcoming-payments
w(f'{R}/upcoming-payments/upcoming-payments.component.ts', '''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { BillPayApiService } from '../../../../core/api/bill-pay-api.service';
import { TransfersApiService } from '../../../../core/api/transfers-api.service';

export interface UpcomingItem {
  id: string;
  when: string;
  label: string;
  amountMinor: number;
  kind: 'transfer' | 'bill';
  link: unknown[];
}

const HORIZON_DAYS = 14;

/** Scheduled transfers and bills due in the next 14 days, merged and sorted by date. */
@Component({
  selector: 'mol-upcoming-payments',
  templateUrl: './upcoming-payments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingPaymentsComponent implements OnInit {
  items$!: Observable<UpcomingItem[]>;

  constructor(private readonly transfers: TransfersApiService, private readonly billPay: BillPayApiService) {}

  ngOnInit(): void {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + HORIZON_DAYS);
    const cutoff = horizon.toISOString().slice(0, 10);

    const transfers$ = this.transfers.scheduled().pipe(
      map(list => list.filter(t => t.scheduledFor <= cutoff).map<UpcomingItem>(t => ({
        id: t.transferId, when: t.scheduledFor, kind: 'transfer', amountMinor: t.amountMinor,
        label: t.memo || (t.type === 'internal' ? 'Transfer between accounts' : 'External transfer'),
        link: ['/transfers', t.transferId]
      }))),
      catchError(() => of([] as UpcomingItem[]))
    );
    const bills$ = this.billPay.bills().pipe(
      map(list => list.filter(b => (b.status === 'due' || b.status === 'scheduled' || b.status === 'overdue') && b.dueAt <= cutoff).map<UpcomingItem>(b => ({
        id: b.billId, when: b.dueAt, kind: 'bill', amountMinor: b.amountDueMinor, label: b.payeeName, link: ['/bill-pay']
      }))),
      catchError(() => of([] as UpcomingItem[]))
    );
    this.items$ = combineLatest([transfers$, bills$]).pipe(map(([a, b]) => [...a, ...b].sort((x, y) => x.when.localeCompare(y.when))));
  }

  total(items: UpcomingItem[]): number {
    return items.reduce((sum, i) => sum + i.amountMinor, 0);
  }
}
''')
w(f'{R}/upcoming-payments/upcoming-payments.component.html', '''
<cn-card title="Coming up" i18n-title="@@dashboard.upcoming.title" subtitle="Next 14 days" i18n-subtitle="@@dashboard.upcoming.subtitle" class="mol-widget" [padded]="false">
  <ng-container *ngIf="items$ | async as items; else loading">
    <ng-container *ngIf="items.length; else empty">
      <ul class="mol-upcoming">
        <li *ngFor="let item of items" fxLayout="row" fxLayoutAlign="space-between center" fxLayoutGap="12px" [routerLink]="item.link">
          <mat-icon class="mol-muted" aria-hidden="true">{{ item.kind === 'bill' ? 'receipt' : 'swap_horiz' }}</mat-icon>
          <div fxFlex fxLayout="column">
            <span>{{ item.label }}</span>
            <span class="mol-muted">{{ item.when | date:'EEE d MMM' }}</span>
          </div>
          <span>{{ item.amountMinor | minorAmount }}</span>
        </li>
      </ul>
      <div class="mol-upcoming__foot" fxLayout="row" fxLayoutAlign="space-between center">
        <span class="mol-muted" i18n="@@dashboard.upcoming.total">Total leaving your accounts</span>
        <strong>{{ total(items) | minorAmount }}</strong>
      </div>
    </ng-container>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="3"></mol-loading-panel></ng-template>
  <ng-template #empty>
    <mol-empty-state icon="event_available" title="Nothing scheduled" i18n-title="@@dashboard.upcoming.empty" body="No transfers or bill payments are due in the next two weeks." i18n-body="@@dashboard.upcoming.emptyBody"></mol-empty-state>
  </ng-template>
</cn-card>
''')
w(f'{R}/upcoming-payments/upcoming-payments.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { UpcomingPaymentsComponent } from './upcoming-payments.component';

describe('UpcomingPaymentsComponent', () => {
  let fixture: ComponentFixture<UpcomingPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpcomingPaymentsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingPaymentsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sums the amounts leaving the account', () => {
    expect(fixture.componentInstance.total([
      { id: '1', when: '2026-09-10', label: 'Rent', amountMinor: 120000, kind: 'bill', link: [] },
      { id: '2', when: '2026-09-11', label: 'Savings', amountMinor: 5000, kind: 'transfer', link: [] }
    ])).toBe(125000);
  });
});
''')

# ---------------- alerts-digest
w(f'{R}/alerts-digest/alerts-digest.component.ts', '''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertHistoryItem } from '../../../../core/api/models';

/** Unread alerts since last sign-in, newest first, capped at five. */
@Component({
  selector: 'mol-alerts-digest',
  templateUrl: './alerts-digest.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsDigestComponent implements OnInit {
  items$!: Observable<AlertHistoryItem[]>;
  dismissed = new Set<string>();

  constructor(private readonly api: AlertsApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.items$ = this.api.history(1, 20).pipe(
      map(list => list.filter(i => !i.read).slice(0, 5)),
      catchError(() => of([] as AlertHistoryItem[]))
    );
  }

  dismiss(item: AlertHistoryItem): void {
    this.dismissed.add(item.id);
    this.api.markRead([item.id]).subscribe({ error: () => { this.dismissed.delete(item.id); this.cdr.markForCheck(); } });
  }

  visible(items: AlertHistoryItem[]): AlertHistoryItem[] {
    return items.filter(i => !this.dismissed.has(i.id));
  }

  iconFor(code: string): string {
    if (code.startsWith('security.')) return 'shield';
    if (code.startsWith('balance.')) return 'account_balance_wallet';
    if (code.startsWith('card.')) return 'credit_card';
    return 'notifications';
  }
}
''')
w(f'{R}/alerts-digest/alerts-digest.component.html', '''
<cn-card title="Alerts" i18n-title="@@dashboard.alerts.title" class="mol-widget" [padded]="false">
  <ng-container *ngIf="items$ | async as items; else loading">
    <ul class="mol-digest" *ngIf="visible(items).length; else empty">
      <li *ngFor="let a of visible(items)" fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="12px">
        <mat-icon class="mol-muted" aria-hidden="true">{{ iconFor(a.code) }}</mat-icon>
        <div fxFlex fxLayout="column">
          <span>{{ a.summary }}</span>
          <span class="mol-muted">{{ a.sentAt | relativeDate }} &middot; {{ a.channel }}</span>
        </div>
        <cn-icon-button icon="close" ariaLabel="Dismiss alert" i18n-ariaLabel="@@dashboard.alerts.dismiss" (pressed)="dismiss(a)"></cn-icon-button>
      </li>
    </ul>
    <a class="mol-widget__foot" routerLink="/alerts/history" i18n="@@dashboard.alerts.all">All alerts</a>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="2"></mol-loading-panel></ng-template>
  <ng-template #empty>
    <mol-empty-state icon="notifications_none" title="You are all caught up" i18n-title="@@dashboard.alerts.empty"></mol-empty-state>
  </ng-template>
</cn-card>
''')
w(f'{R}/alerts-digest/alerts-digest.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertsDigestComponent } from './alerts-digest.component';

describe('AlertsDigestComponent', () => {
  let fixture: ComponentFixture<AlertsDigestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertsDigestComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsDigestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('picks an icon by alert code family', () => {
    const c = fixture.componentInstance;
    expect(c.iconFor('security.new-device')).toBe('shield');
    expect(c.iconFor('card.declined')).toBe('credit_card');
    expect(c.iconFor('anything-else')).toBe('notifications');
  });
});
''')

# promo banner: make it a real banner, not a page header
w(f'{R}/promo-banner/promo-banner.component.ts', '''
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectDismissedBanners, sessionActions } from '../../../../core/store/session';
import { LanternService } from '../../../../core/telemetry/lantern.service';

/** Marketing slot fed by Semaphore flag mol.dashboard.promo; hidden when the flag is off. */
@Component({
  selector: 'mol-promo-banner',
  templateUrl: './promo-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoBannerComponent {
  /** Copy is owned by Marketing Ops; the id changes per campaign so dismissals do not carry over. */
  readonly bannerId = 'promo-reserve-savings-2026q3';
  readonly dismissed$ = this.store.select(selectDismissedBanners);
  @Output() readonly dismissed = new EventEmitter<void>();

  constructor(private readonly store: Store, private readonly lantern: LanternService) {}

  dismiss(): void {
    this.store.dispatch(sessionActions.bannerDismissed({ bannerId: this.bannerId }));
    this.lantern.track('dashboard.promo.dismissed', { bannerId: this.bannerId });
    this.dismissed.emit();
  }

  learnMore(): void {
    this.lantern.track('dashboard.promo.clicked', { bannerId: this.bannerId });
  }
}
''')
w(f'{R}/promo-banner/promo-banner.component.html', '''
<aside *ngIf="!((dismissed$ | async) ?? []).includes(bannerId)" class="mol-promo" role="complementary" aria-label="Offer" fxLayout="row" fxLayout.lt-md="column" fxLayoutAlign="space-between center" fxLayoutGap="16px">
  <div fxFlex>
    <strong i18n="@@dashboard.promoBanner.headline">Earn 4.10% APY with Meridian Reserve Savings</strong>
    <p class="mol-muted" i18n="@@dashboard.promoBanner.p1">Rate as of today and subject to change. See disclosures for details.</p>
  </div>
  <div fxLayout="row" fxLayoutGap="8px">
    <cn-button variant="secondary" size="small" routerLink="/open-account" (pressed)="learnMore()" i18n="@@dashboard.promoBanner.learnMore">Learn more</cn-button>
    <cn-icon-button icon="close" ariaLabel="Dismiss offer" i18n-ariaLabel="@@dashboard.promoBanner.dismiss" (pressed)="dismiss()"></cn-icon-button>
  </div>
</aside>
''')
w(f'{R}/promo-banner/promo-banner.component.spec.ts', '''
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { sessionActions, sessionFeatureKey } from '../../../../core/store/session';
import { PromoBannerComponent } from './promo-banner.component';

describe('PromoBannerComponent', () => {
  let fixture: ComponentFixture<PromoBannerComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoBannerComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { [sessionFeatureKey]: { dismissedBanners: [] } } }),
        { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }
      ]
    }).compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PromoBannerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('records a dismissal in session state', () => {
    const spy = spyOn(store, 'dispatch');
    fixture.componentInstance.dismiss();
    expect(spy).toHaveBeenCalledWith(sessionActions.bannerDismissed({ bannerId: fixture.componentInstance.bannerId }));
  });
});
''')
