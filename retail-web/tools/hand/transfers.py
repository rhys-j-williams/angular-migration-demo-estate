import os
F='/home/ubuntu/repos/angular-migration-demo-estate/retail-web/src/app/features/transfers'
R=F+'/components'
def w(p,s):
    os.makedirs(os.path.dirname(p),exist_ok=True); open(p,'w').write(s.lstrip('\n'))

# ---------------- draft service
w(f'{F}/services/transfer-draft.service.ts', '''
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Account, TransferFrequency, TransferLimits, TransferType } from '../../../core/api/models';
import { PENDING_AMOUNT_SOURCE_KEY } from '../../../core/guards/mfa-step-up.guard';

export interface TransferDraft {
  type: TransferType;
  fromAccountId: string | null;
  toAccountId: string | null;
  payeeId: string | null;
  amountMinor: number | null;
  memo: string;
  scheduledFor: string | null;
  frequency: TransferFrequency;
  endAfterOccurrences: number | null;
  /** Generated once per draft so a retry after a network blip does not double-send (MOL-3305). */
  idempotencyKey: string;
}

const DRAFT_KEY = 'mol.transfers.draft';

/**
 * Holds the in-progress transfer across the wizard steps and the review route. Persisted to
 * sessionStorage (not the store) because the MFA step-up round trip through Keystone reloads the
 * app; see MfaStepUpGuard. Cleared on submit, cancel and logout.
 */
@Injectable({ providedIn: 'root' })
export class TransferDraftService {
  private readonly draft$ = new BehaviorSubject<TransferDraft>(this.restore());
  accounts: Account[] = [];
  limits: TransferLimits | null = null;

  get value(): TransferDraft {
    return this.draft$.value;
  }

  get changes(): Observable<TransferDraft> {
    return this.draft$.asObservable();
  }

  get dirty(): boolean {
    const d = this.value;
    return d.fromAccountId !== null || d.toAccountId !== null || d.payeeId !== null || d.amountMinor !== null || d.memo !== '';
  }

  patch(change: Partial<TransferDraft>): void {
    const next = { ...this.value, ...change };
    this.draft$.next(next);
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    if (next.amountMinor === null) {
      sessionStorage.removeItem(PENDING_AMOUNT_SOURCE_KEY);
    } else {
      sessionStorage.setItem(PENDING_AMOUNT_SOURCE_KEY, String(next.amountMinor));
    }
  }

  clear(): void {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(PENDING_AMOUNT_SOURCE_KEY);
    this.draft$.next(TransferDraftService.empty());
  }

  account(id: string | null): Account | undefined {
    return id ? this.accounts.find(a => a.accountId === id) : undefined;
  }

  static empty(): TransferDraft {
    return {
      type: 'internal', fromAccountId: null, toAccountId: null, payeeId: null, amountMinor: null, memo: '',
      scheduledFor: null, frequency: 'once', endAfterOccurrences: null, idempotencyKey: crypto.randomUUID()
    };
  }

  private restore(): TransferDraft {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return TransferDraftService.empty();
    try {
      return { ...TransferDraftService.empty(), ...(JSON.parse(raw) as Partial<TransferDraft>) };
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
      return TransferDraftService.empty();
    }
  }
}
''')

# ---------------- transfers-home
w(f'{R}/transfers-home/transfers-home.component.ts', '''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { FeatureFlagService } from '../../../../core/flags/feature-flag.service';
import { EntitlementsService } from '../../../../core/entitlements/entitlements.service';
import { transfersActions } from '../../store/transfers.actions';
import { transfersSelectors } from '../../store/transfers.selectors';

/** Landing: new transfer entry points, scheduled list and recent history tabs. */
@Component({
  selector: 'mol-transfers-home',
  templateUrl: './transfers-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransfersHomeComponent implements OnInit {
  readonly scheduledCount$ = this.store.select(transfersSelectors.selectTotal);
  readonly wiresEnabled$ = this.flags.isEnabled$('mol.transfers.wires');
  readonly externalEntitled$ = this.entitlements.has$('external-transfers');
  tab = 0;

  constructor(
    private readonly store: Store,
    private readonly flags: FeatureFlagService,
    private readonly entitlements: EntitlementsService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(transfersActions.load());
  }
}
''')
w(f'{R}/transfers-home/transfers-home.component.html', '''
<cn-page-header title="Transfers" i18n-title="@@transfers.home.title" lede="Move money between your accounts, to other people, or to accounts you hold elsewhere." i18n-lede="@@transfers.home.lede"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <div class="mol-entry-points" fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="12px">
    <cn-card fxFlex [padded]="true" title="Between my accounts" i18n-title="@@transfers.home.internal">
      <p class="mol-muted" i18n="@@transfers.home.internalBody">Immediate. No limit other than your available balance.</p>
      <cn-button variant="primary" routerLink="new" [queryParams]="{ type: 'internal' }" i18n="@@transfers.home.start">Start</cn-button>
    </cn-card>
    <cn-card fxFlex [padded]="true" title="To an external account" i18n-title="@@transfers.home.external" *ngIf="externalEntitled$ | async">
      <p class="mol-muted" i18n="@@transfers.home.externalBody">ACH, 1 to 3 business days. Daily limits apply and new accounts need verifying first.</p>
      <div fxLayout="row" fxLayoutGap="8px">
        <cn-button variant="secondary" routerLink="new" [queryParams]="{ type: 'external' }" i18n="@@transfers.home.start">Start</cn-button>
        <cn-button variant="tertiary" routerLink="payees" i18n="@@transfers.home.payees">Manage accounts</cn-button>
      </div>
    </cn-card>
    <cn-card fxFlex [padded]="true" title="Send with PayLink" i18n-title="@@transfers.home.paylink">
      <p class="mol-muted" i18n="@@transfers.home.paylinkBody">To a person by mobile number or email. Usually arrives within minutes.</p>
      <cn-button variant="secondary" routerLink="new" [queryParams]="{ type: 'paylink' }" i18n="@@transfers.home.start">Start</cn-button>
    </cn-card>
    <cn-card fxFlex [padded]="true" title="Wire" i18n-title="@@transfers.home.wire" *ngIf="wiresEnabled$ | async">
      <p class="mol-muted" i18n="@@transfers.home.wireBody">Same day if requested before 4:00 PM Eastern. A fee applies; see the schedule of fees.</p>
      <cn-button variant="secondary" routerLink="new" [queryParams]="{ type: 'wire' }" i18n="@@transfers.home.start">Start</cn-button>
    </cn-card>
  </div>

  <cn-tabs [selectedIndex]="tab" (selectedChange)="tab = $event" ariaLabel="Transfer activity">
    <ng-template cnTab label="Scheduled" i18n-label="@@transfers.home.tabScheduled" [badge]="scheduledCount$ | async">
      <mol-scheduled-transfers></mol-scheduled-transfers>
    </ng-template>
    <ng-template cnTab label="Limits" i18n-label="@@transfers.home.tabLimits">
      <mol-transfer-limits-panel></mol-transfer-limits-panel>
    </ng-template>
  </cn-tabs>
  <a routerLink="history" class="mol-link" i18n="@@transfers.home.history">Transfer history</a>
</div>
''')

# ---------------- wizard
w(f'{R}/transfer-wizard/transfer-wizard.component.ts', '''
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CnStepperShellComponent } from '@meridian/canopy-ui/navigation';

import { Account, TransferLimits, TransferType } from '../../../../core/api/models';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { TransferDraftService } from '../../services/transfer-draft.service';
import { TransferDetailsStepComponent } from '../transfer-details-step/transfer-details-step.component';
import { TransferScheduleStepComponent } from '../transfer-schedule-step/transfer-schedule-step.component';

const TYPES: TransferType[] = ['internal', 'external', 'paylink', 'wire'];

/**
 * Stepper shell for the transfer flow; owns the draft and parks the amount for the MFA guard.
 *
 * Steps 1 and 2 live here. Step 3 (review) is its own route so MfaStepUpGuard can sit in front of
 * it and so a Keystone step-up can land the customer straight back on it. The draft survives the
 * round trip via TransferDraftService.
 */
@Component({
  selector: 'mol-transfer-wizard',
  templateUrl: './transfer-wizard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferWizardComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  @ViewChild(CnStepperShellComponent) stepper?: CnStepperShellComponent;
  @ViewChild(TransferDetailsStepComponent) details?: TransferDetailsStepComponent;
  @ViewChild(TransferScheduleStepComponent) schedule?: TransferScheduleStepComponent;

  accounts: Account[] = [];
  limits!: TransferLimits;
  private submitted = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    readonly draft: TransferDraftService,
    private readonly lantern: LanternService
  ) {}

  ngOnInit(): void {
    this.accounts = this.route.snapshot.data['accounts'] as Account[];
    this.limits = this.route.snapshot.data['limits'] as TransferLimits;
    this.draft.accounts = this.accounts;
    this.draft.limits = this.limits;

    // Entry points pre-fill via query string: /transfers/new?type=external&from=acc-1&amountMinor=5000
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(q => {
      const type = q.get('type');
      const amount = Number(q.get('amountMinor'));
      this.draft.patch({
        type: type && TYPES.includes(type as TransferType) ? (type as TransferType) : this.draft.value.type,
        fromAccountId: q.get('from') ?? this.draft.value.fromAccountId,
        toAccountId: q.get('to') ?? this.draft.value.toAccountId,
        amountMinor: Number.isFinite(amount) && amount > 0 ? amount : this.draft.value.amountMinor
      });
    });
    this.lantern.page('transfer.wizard', { type: this.draft.value.type });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasUnsavedChanges(): boolean {
    return !this.submitted && this.draft.dirty;
  }

  onStepChange(index: number): void {
    this.lantern.track('transfer.wizard.step', { step: index });
  }

  review(): void {
    if (!this.details?.commit() || !this.schedule?.commit()) {
      return;
    }
    this.submitted = true; // leaving for review is not abandoning; the review step owns the draft now
    void this.router.navigate(['review'], { relativeTo: this.route });
  }

  cancel(): void {
    this.draft.clear();
    this.submitted = true;
    void this.router.navigate(['/transfers']);
  }
}
''')
w(f'{R}/transfer-wizard/transfer-wizard.component.html', '''
<cn-page-header title="New transfer" i18n-title="@@transfers.wizard.title" backLink="/transfers" backLabel="Transfers" i18n-backLabel="@@transfers.back"></cn-page-header>

<div class="mol-page mol-wizard">
  <cn-stepper-shell [linear]="true" continueLabel="Continue" backLabel="Back" finishLabel="Review" (stepChange)="onStepChange($event)" (completed)="review()" (cancelled)="cancel()">
    <ng-template cnStep label="Details" i18n-label="@@transfers.wizard.step1" [control]="details?.form ?? null">
      <mol-transfer-details-step [accounts]="accounts" [limits]="limits"></mol-transfer-details-step>
    </ng-template>
    <ng-template cnStep label="Schedule" i18n-label="@@transfers.wizard.step2" [control]="schedule?.form ?? null">
      <mol-transfer-schedule-step [limits]="limits"></mol-transfer-schedule-step>
    </ng-template>
  </cn-stepper-shell>
</div>
''')

# ---------------- details step (typed forms)
w(f'{R}/transfer-details-step/transfer-details-step.component.ts', '''
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { CnSelectOption } from '@meridian/canopy-ui/forms';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Account, Payee, TransferLimits, TransferType } from '../../../../core/api/models';
import { TransferDraftService } from '../../services/transfer-draft.service';

export interface TransferDetailsForm {
  type: FormControl<TransferType>;
  fromAccountId: FormControl<string>;
  toAccountId: FormControl<string>;
  payeeId: FormControl<string>;
  amountMinor: FormControl<number | null>;
  memo: FormControl<string>;
}

/** Cross-field: from and to cannot match; external types need a payee not an account. */
export function destinationValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup<TransferDetailsForm>;
    const { type, fromAccountId, toAccountId, payeeId } = g.getRawValue();
    if (type === 'internal') {
      if (!toAccountId) return { destinationRequired: true };
      if (toAccountId === fromAccountId) return { sameAccount: true };
      return null;
    }
    return payeeId ? null : { payeeRequired: true };
  };
}

export function sufficientFundsValidator(lookup: (id: string) => Account | undefined): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup<TransferDetailsForm>;
    const { fromAccountId, amountMinor } = g.getRawValue();
    const from = lookup(fromAccountId);
    if (!from || amountMinor === null) return null;
    return amountMinor > from.availableBalanceMinor ? { insufficientFunds: { availableMinor: from.availableBalanceMinor } } : null;
  };
}

/** From, to, amount and memo. Typed reactive form. */
@Component({
  selector: 'mol-transfer-details-step',
  templateUrl: './transfer-details-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferDetailsStepComponent implements OnInit, OnDestroy {
  @Input() accounts: Account[] = [];
  @Input() limits!: TransferLimits;

  readonly form: FormGroup<TransferDetailsForm> = this.fb.group(
    {
      type: this.fb.control<TransferType>('internal'),
      fromAccountId: this.fb.control('', Validators.required),
      toAccountId: this.fb.control(''),
      payeeId: this.fb.control(''),
      amountMinor: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      memo: this.fb.control('', [Validators.maxLength(60), Validators.pattern(/^[\\w .,'&-]*$/)])
    },
    { validators: [destinationValidator(), sufficientFundsValidator(id => this.accounts.find(a => a.accountId === id))] }
  );

  readonly typeOptions: CnSelectOption<TransferType>[] = [
    { value: 'internal', label: 'Between my accounts' },
    { value: 'external', label: 'To an external account', description: '1 to 3 business days' },
    { value: 'paylink', label: 'PayLink to a person', description: 'Usually within minutes' },
    { value: 'wire', label: 'Wire', description: 'Fee applies' }
  ];
  payees$: Observable<CnSelectOption<string>[]> = of([]);

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly fb: NonNullableFormBuilder, private readonly draft: TransferDraftService, private readonly api: TransfersApiService) {}

  ngOnInit(): void {
    const d = this.draft.value;
    this.form.patchValue({
      type: d.type, fromAccountId: d.fromAccountId ?? '', toAccountId: d.toAccountId ?? '', payeeId: d.payeeId ?? '', amountMinor: d.amountMinor, memo: d.memo
    });
    this.form.controls.type.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(type => this.applyType(type));
    this.applyType(d.type);
    // Park the amount continuously so a step-up mid flow never loses it.
    this.form.controls.amountMinor.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(amountMinor => this.draft.patch({ amountMinor }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get fromOptions(): CnSelectOption<string>[] {
    return this.accounts
      .filter(a => a.status === 'open' && a.type !== 'credit-card' && a.type !== 'mortgage' && a.type !== 'auto-loan' && a.type !== 'certificate')
      .map(a => ({ value: a.accountId, label: `${a.nickname} (${a.accountNumber.slice(-4)})`, description: `Available ${(a.availableBalanceMinor / 100).toFixed(2)}` }));
  }

  get toOptions(): CnSelectOption<string>[] {
    const from = this.form.controls.fromAccountId.value;
    return this.accounts
      .filter(a => a.accountId !== from && a.status !== 'closed')
      .map(a => ({ value: a.accountId, label: `${a.nickname} (${a.accountNumber.slice(-4)})`, group: a.type === 'credit-card' || a.type === 'mortgage' || a.type === 'auto-loan' ? 'Pay down' : 'Deposit' }));
  }

  get perTransactionMaxMinor(): number {
    const t = this.form.controls.type.value;
    return t === 'internal' ? this.limits.perTransactionInternalMinor : this.limits.perTransactionExternalMinor;
  }

  get remainingDailyMinor(): number {
    return Math.max(0, this.limits.dailyExternalLimitMinor - this.limits.dailyExternalUsedMinor);
  }

  get overLimit(): boolean {
    const amt = this.form.controls.amountMinor.value ?? 0;
    const t = this.form.controls.type.value;
    if (amt > this.perTransactionMaxMinor) return true;
    return t !== 'internal' && amt > this.remainingDailyMinor;
  }

  get insufficient(): number | null {
    const err = this.form.errors?.['insufficientFunds'] as { availableMinor: number } | undefined;
    return err ? err.availableMinor : null;
  }

  /** Called by the wizard before advancing. Writes the form into the draft; false if invalid. */
  commit(): boolean {
    if (this.form.invalid || this.overLimit) {
      this.form.markAllAsTouched();
      return false;
    }
    const v = this.form.getRawValue();
    this.draft.patch({
      type: v.type,
      fromAccountId: v.fromAccountId,
      toAccountId: v.type === 'internal' ? v.toAccountId : null,
      payeeId: v.type === 'internal' ? null : v.payeeId,
      amountMinor: v.amountMinor,
      memo: v.memo.trim()
    });
    return true;
  }

  private applyType(type: TransferType): void {
    if (type === 'internal') {
      this.form.controls.payeeId.setValue('');
      this.payees$ = of([]);
      return;
    }
    this.form.controls.toAccountId.setValue('');
    const payeeType: Payee['type'] = type === 'paylink' ? 'paylink' : 'external-transfer';
    this.payees$ = this.api.payees(payeeType).pipe(
      map(list => list.map(p => ({ value: p.payeeId, label: p.nickname || p.name, description: p.verified ? `Ending ${p.accountNumberLastFour}` : 'Not yet verified', disabled: !p.verified }))),
      catchError(() => of([]))
    );
  }
}
''')
w(f'{R}/transfer-details-step/transfer-details-step.component.html', '''
<form [formGroup]="form" novalidate fxLayout="column" fxLayoutGap="12px" class="mol-step">
  <cn-radio-group formControlName="type" legend="What kind of transfer?" i18n-legend="@@transfers.details.type" [options]="typeOptions" [required]="true"></cn-radio-group>

  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px">
    <cn-select fxFlex formControlName="fromAccountId" label="From" i18n-label="@@transfer.from" [options]="fromOptions" [required]="true"
      [errorText]="form.controls.fromAccountId.touched && form.controls.fromAccountId.invalid ? 'Choose the account to take the money from' : null"></cn-select>

    <cn-select *ngIf="form.controls.type.value === 'internal'" fxFlex formControlName="toAccountId" label="To" i18n-label="@@transfer.to" [options]="toOptions" [required]="true"
      [errorText]="form.touched && form.errors?.['sameAccount'] ? 'From and to must be different accounts' : form.touched && form.errors?.['destinationRequired'] ? 'Choose where the money is going' : null"></cn-select>

    <cn-select *ngIf="form.controls.type.value !== 'internal'" fxFlex formControlName="payeeId" label="To" i18n-label="@@transfer.to" [options]="(payees$ | async) ?? []" [required]="true"
      hint="Only verified accounts can receive transfers" i18n-hint="@@transfers.details.payeeHint"
      [errorText]="form.touched && form.errors?.['payeeRequired'] ? 'Choose a recipient' : null"></cn-select>
  </div>

  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px" fxLayoutAlign="start start">
    <mat-form-field appearance="outline" fxFlex="0 0 260px" fxFlex.lt-md="1 1 auto">
      <mat-label i18n="@@transfer.amount">Amount</mat-label>
      <cn-currency-input formControlName="amountMinor" [min]="1" [max]="perTransactionMaxMinor" [allowNegative]="false"></cn-currency-input>
      <mat-hint *ngIf="!overLimit && insufficient === null" i18n="@@transfers.details.limitHint">Up to {{ perTransactionMaxMinor | minorAmount }} per transfer</mat-hint>
      <mat-hint *ngIf="insufficient !== null" class="mol-warn" i18n="@@transfers.details.insufficient">Only {{ insufficient | minorAmount }} is available in that account</mat-hint>
      <mat-hint *ngIf="overLimit && insufficient === null" class="mol-warn" i18n="@@transfers.details.overLimit">That is above your limit. {{ remainingDailyMinor | minorAmount }} remains today for external transfers.</mat-hint>
      <mat-error *ngIf="form.controls.amountMinor.hasError('required')" i18n="@@transfers.details.amountRequired">Enter an amount</mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" fxFlex>
      <mat-label i18n="@@transfers.details.memo">Memo (optional)</mat-label>
      <input matInput formControlName="memo" maxlength="60" molTrimOnBlur autocomplete="off" />
      <mat-hint align="end">{{ form.controls.memo.value.length }}/60</mat-hint>
      <mat-error *ngIf="form.controls.memo.hasError('pattern')" i18n="@@transfers.details.memoPattern">Letters, numbers and basic punctuation only</mat-error>
    </mat-form-field>
  </div>

  <p *ngIf="form.controls.type.value === 'wire'" class="mol-note" i18n="@@transfers.details.wireNote">Domestic wires cost $25 and cannot be recalled once sent. Requests after 4:00 PM Eastern go the next business day.</p>
</form>
''')

# ---------------- schedule step
w(f'{R}/transfer-schedule-step/transfer-schedule-step.component.ts', '''
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

import { CnRadioOption } from '@meridian/canopy-ui/forms';

import { TransferFrequency, TransferLimits } from '../../../../core/api/models';
import { ConfigService } from '../../../../core/config/config.service';
import { TransferDraftService } from '../../services/transfer-draft.service';

export interface ScheduleForm {
  when: FormControl<'now' | 'later'>;
  scheduledFor: FormControl<string>;
  frequency: FormControl<TransferFrequency>;
  endAfterOccurrences: FormControl<number | null>;
}

/**
 * Date and frequency with cutoff handling. "Today" after the cutoff silently becomes the next
 * business day; the review step spells that out so nobody is surprised (complaint CMP-2023-118).
 */
@Component({
  selector: 'mol-transfer-schedule-step',
  templateUrl: './transfer-schedule-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferScheduleStepComponent implements OnInit {
  @Input() limits!: TransferLimits;

  readonly form: FormGroup<ScheduleForm> = this.fb.group({
    when: this.fb.control<'now' | 'later'>('now'),
    scheduledFor: this.fb.control(''),
    frequency: this.fb.control<TransferFrequency>('once'),
    endAfterOccurrences: this.fb.control<number | null>(null, [Validators.min(2), Validators.max(60)])
  });

  readonly whenOptions: CnRadioOption<'now' | 'later'>[] = [
    { value: 'now', label: 'As soon as possible' },
    { value: 'later', label: 'On a date I choose' }
  ];
  readonly frequencyOptions: CnRadioOption<TransferFrequency>[] = [
    { value: 'once', label: 'Once' },
    { value: 'weekly', label: 'Every week' },
    { value: 'biweekly', label: 'Every two weeks' },
    { value: 'monthly', label: 'Every month', description: 'On the same day each month; the 29th to 31st fall back to the last day.' }
  ];

  constructor(private readonly fb: NonNullableFormBuilder, private readonly draft: TransferDraftService, private readonly config: ConfigService) {}

  ngOnInit(): void {
    const d = this.draft.value;
    this.form.patchValue({
      when: d.scheduledFor ? 'later' : 'now',
      scheduledFor: d.scheduledFor ?? '',
      frequency: d.frequency,
      endAfterOccurrences: d.endAfterOccurrences
    });
  }

  get minDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get afterCutoff(): boolean {
    return TransferScheduleStepComponent.isAfterCutoff(new Date(), this.config.value.transfers.cutoffLocalTime, this.config.value.transfers.cutoffTimeZone);
  }

  get effectiveDate(): string {
    const v = this.form.getRawValue();
    if (v.when === 'later' && v.scheduledFor) return v.scheduledFor;
    if (this.draft.value.type === 'internal') return this.minDate;
    return this.afterCutoff ? this.limits.nextBusinessDay : this.minDate;
  }

  commit(): boolean {
    const v = this.form.getRawValue();
    if (v.when === 'later' && (!v.scheduledFor || v.scheduledFor < this.minDate)) {
      this.form.controls.scheduledFor.setErrors({ pastDate: true });
      this.form.markAllAsTouched();
      return false;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    this.draft.patch({
      scheduledFor: this.effectiveDate,
      frequency: v.frequency,
      endAfterOccurrences: v.frequency === 'once' ? null : v.endAfterOccurrences
    });
    return true;
  }

  static isAfterCutoff(now: Date, cutoffLocalTime: string, timeZone: string): boolean {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    const hh = Number(parts.find(p => p.type === 'hour')?.value ?? '0') % 24;
    const mm = Number(parts.find(p => p.type === 'minute')?.value ?? '0');
    const [ch, cm] = cutoffLocalTime.split(':').map(Number);
    return hh > ch || (hh === ch && mm >= cm);
  }
}
''')
w(f'{R}/transfer-schedule-step/transfer-schedule-step.component.html', '''
<form [formGroup]="form" novalidate fxLayout="column" fxLayoutGap="16px" class="mol-step">
  <cn-radio-group formControlName="when" legend="When should it go?" i18n-legend="@@transfers.schedule.when" [options]="whenOptions"></cn-radio-group>

  <mat-form-field *ngIf="form.controls.when.value === 'later'" appearance="outline" fxFlex="0 0 260px">
    <mat-label i18n="@@transfers.schedule.date">Send on</mat-label>
    <input matInput type="date" formControlName="scheduledFor" [min]="minDate" />
    <mat-error *ngIf="form.controls.scheduledFor.hasError('pastDate')" i18n="@@transfers.schedule.pastDate">Choose today or a later date</mat-error>
  </mat-form-field>

  <p *ngIf="form.controls.when.value === 'now' && afterCutoff" class="mol-note" i18n="@@transfers.schedule.cutoff">
    It is past today's cutoff for external transfers, so this will be sent on {{ limits.nextBusinessDay | date:'EEEE d MMMM' }}. Transfers between your own accounts still happen today.
  </p>

  <cn-radio-group formControlName="frequency" legend="How often?" i18n-legend="@@transfers.schedule.frequency" [options]="frequencyOptions"></cn-radio-group>

  <mat-form-field *ngIf="form.controls.frequency.value !== 'once'" appearance="outline" fxFlex="0 0 260px">
    <mat-label i18n="@@transfers.schedule.endAfter">Stop after (number of transfers)</mat-label>
    <input matInput type="number" formControlName="endAfterOccurrences" min="2" max="60" inputmode="numeric" />
    <mat-hint i18n="@@transfers.schedule.endAfterHint">Leave blank to continue until you cancel</mat-hint>
    <mat-error *ngIf="form.controls.endAfterOccurrences.invalid" i18n="@@transfers.schedule.endAfterRange">Between 2 and 60</mat-error>
  </mat-form-field>
</form>
''')

# ---------------- review step
w(f'{R}/transfer-review-step/transfer-review-step.component.ts', '''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Account, Payee, TransferRequest } from '../../../../core/api/models';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfigService } from '../../../../core/config/config.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { TransferDraft, TransferDraftService } from '../../services/transfer-draft.service';
import { transfersActions } from '../../store/transfers.actions';

/**
 * Read-back before submit. Behind MfaStepUpGuard: by the time this renders, either the amount is
 * under the threshold or the customer has an mfa_at claim younger than ten minutes.
 */
@Component({
  selector: 'mol-transfer-review-step',
  templateUrl: './transfer-review-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferReviewStepComponent implements OnInit {
  draft!: TransferDraft;
  from?: Account;
  to?: Account;
  payee$: Observable<Payee | undefined> = of(undefined);
  busy = false;
  error: AppError | null = null;
  acknowledged = false;

  constructor(
    readonly drafts: TransferDraftService,
    private readonly api: TransfersApiService,
    private readonly accountsApi: AccountsApiService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.draft = this.drafts.value;
    if (this.draft.amountMinor === null || !this.draft.fromAccountId) {
      void this.router.navigate(['/transfers/new']);
      return;
    }
    // After a Keystone step-up the app has reloaded and the wizard's resolver data is gone.
    if (!this.drafts.accounts.length) {
      this.drafts.accounts = await lastValueFrom(this.accountsApi.list().pipe(catchError(() => of([] as Account[]))));
    }
    this.from = this.drafts.account(this.draft.fromAccountId);
    this.to = this.drafts.account(this.draft.toAccountId);
    if (this.draft.payeeId) {
      this.payee$ = this.api.payees().pipe(map(list => list.find(p => p.payeeId === this.draft.payeeId)), catchError(() => of(undefined)));
    }
    this.cdr.markForCheck();
  }

  get isHighValue(): boolean {
    return (this.draft.amountMinor ?? 0) >= this.config.value.transfers.mfaStepUpThresholdMinor;
  }

  get mfaAgeSeconds(): number | null {
    return this.auth.mfaAgeSeconds();
  }

  get needsAcknowledgement(): boolean {
    return this.draft.type === 'wire' || this.draft.type === 'external';
  }

  get feeMinor(): number {
    return this.draft.type === 'wire' ? 2500 : 0;
  }

  get isToday(): boolean {
    return this.draft.scheduledFor === new Date().toISOString().slice(0, 10);
  }

  submit(): void {
    if (this.busy || (this.needsAcknowledgement && !this.acknowledged)) return;
    this.busy = true;
    this.error = null;
    const request: TransferRequest = {
      type: this.draft.type,
      fromAccountId: this.draft.fromAccountId ?? '',
      toAccountId: this.draft.toAccountId ?? undefined,
      payeeId: this.draft.payeeId ?? undefined,
      amountMinor: this.draft.amountMinor ?? 0,
      memo: this.draft.memo || undefined,
      scheduledFor: this.draft.scheduledFor ?? new Date().toISOString().slice(0, 10),
      frequency: this.draft.frequency,
      endAfterOccurrences: this.draft.endAfterOccurrences ?? undefined,
      idempotencyKey: this.draft.idempotencyKey
    };
    this.api.submit(request).subscribe({
      next: transfer => {
        this.lantern.track('transfer.submitted', { type: transfer.type, frequency: transfer.frequency, highValue: this.isHighValue, status: transfer.status });
        this.drafts.clear();
        this.store.dispatch(transfersActions.upsert({ item: transfer }));
        void this.router.navigate(['/transfers', transfer.transferId, 'confirmation']);
      },
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.lantern.track('transfer.failed', { type: this.draft.type, code: err.code ?? 'unknown' });
        this.cdr.markForCheck();
      }
    });
  }

  edit(): void {
    void this.router.navigate(['/transfers/new']);
  }
}
''')
w(f'{R}/transfer-review-step/transfer-review-step.component.html', '''
<cn-page-header title="Review your transfer" i18n-title="@@transfers.review.title" backLink="/transfers/new" backLabel="Edit" i18n-backLabel="@@action.edit"></cn-page-header>

<div class="mol-page mol-review" fxLayout="column" fxLayoutGap="16px" *ngIf="draft">
  <mol-error-banner [error]="error" [showRetry]="error?.retryable ?? false" (retry)="submit()"></mol-error-banner>

  <cn-card [padded]="true" [highlight]="true">
    <p class="mol-amount">{{ draft.amountMinor | minorAmount }}</p>
    <dl class="mol-dl">
      <dt i18n="@@transfer.from">From</dt>
      <dd>{{ from ? (from | accountLabel) : draft.fromAccountId }}</dd>
      <dt i18n="@@transfer.to">To</dt>
      <dd *ngIf="draft.type === 'internal'">{{ to ? (to | accountLabel) : draft.toAccountId }}</dd>
      <dd *ngIf="draft.type !== 'internal'">
        <ng-container *ngIf="payee$ | async as payee; else payeeId">{{ payee.nickname || payee.name }} <mol-masked-number [last4]="payee.accountNumberLastFour"></mol-masked-number></ng-container>
        <ng-template #payeeId>{{ draft.payeeId }}</ng-template>
      </dd>
      <dt i18n="@@transfers.review.when">When</dt>
      <dd>
        <ng-container *ngIf="isToday; else dated" i18n="@@transfers.review.today">Today</ng-container>
        <ng-template #dated>{{ draft.scheduledFor | date:'EEEE d MMMM y' }}</ng-template>
        <span *ngIf="draft.frequency !== 'once'"> &middot; {{ draft.frequency }}<ng-container *ngIf="draft.endAfterOccurrences">, {{ draft.endAfterOccurrences }} times</ng-container></span>
      </dd>
      <dt *ngIf="draft.memo" i18n="@@transfers.details.memo">Memo</dt>
      <dd *ngIf="draft.memo">{{ draft.memo }}</dd>
      <dt *ngIf="feeMinor" i18n="@@transfers.review.fee">Fee</dt>
      <dd *ngIf="feeMinor">{{ feeMinor | minorAmount }}</dd>
    </dl>
  </cn-card>

  <p *ngIf="isHighValue" class="mol-note" fxLayout="row" fxLayoutGap="8px" fxLayoutAlign="start center">
    <mat-icon aria-hidden="true">verified_user</mat-icon>
    <span i18n="@@transfers.review.stepUpDone">You verified your identity {{ mfaAgeSeconds ?? 0 }} seconds ago. Large transfers need a recent verification.</span>
  </p>

  <cn-checkbox *ngIf="needsAcknowledgement" [(ngModel)]="acknowledged" [ngModelOptions]="{ standalone: true }" i18n="@@transfers.review.ack">
    I have checked the recipient details. Transfers to the wrong account may not be recoverable.
  </cn-checkbox>

  <div fxLayout="row" fxLayout.lt-md="column-reverse" fxLayoutGap="8px" fxLayoutAlign="end">
    <cn-button variant="tertiary" (pressed)="edit()" [disabled]="busy" i18n="@@action.edit">Edit</cn-button>
    <cn-button variant="primary" [loading]="busy" [disabled]="needsAcknowledgement && !acknowledged" (pressed)="submit()" i18n="@@transfers.review.confirm">Confirm transfer</cn-button>
  </div>
</div>
''')

# ---------------- confirmation
w(f'{R}/transfer-confirmation/transfer-confirmation.component.ts', '''
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Transfer } from '../../../../core/api/models';
import { transfersSelectors } from '../../store/transfers.selectors';

/** Confirmation number, arrival estimate and next actions. Reads from the store first, then the BFF. */
@Component({
  selector: 'mol-transfer-confirmation',
  templateUrl: './transfer-confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferConfirmationComponent {
  readonly transfer$: Observable<Transfer> = this.route.paramMap.pipe(
    map(p => p.get('transferId') ?? ''),
    switchMap(id => this.store.select(transfersSelectors.selectById(id)).pipe(switchMap(t => (t ? [t] : this.api.byId(id)))))
  );

  constructor(private readonly route: ActivatedRoute, private readonly store: Store, private readonly api: TransfersApiService) {}

  headline(t: Transfer): string {
    switch (t.status) {
      case 'completed': return $localize`:@@transfers.confirm.completed:Transfer complete`;
      case 'scheduled': return $localize`:@@transfers.confirm.scheduled:Transfer scheduled`;
      case 'failed': return $localize`:@@transfers.confirm.failed:We could not send this transfer`;
      default: return $localize`:@@transfers.confirm.pending:Transfer submitted`;
    }
  }

  print(): void {
    window.print();
  }
}
''')
w(f'{R}/transfer-confirmation/transfer-confirmation.component.html', '''
<ng-container *ngIf="transfer$ | async as t; else loading">
  <div class="mol-page mol-confirmation" fxLayout="column" fxLayoutAlign="center center" fxLayoutGap="16px">
    <mat-icon class="mol-confirmation__icon" [class.mol-confirmation__icon--failed]="t.status === 'failed'" aria-hidden="true">{{ t.status === 'failed' ? 'error_outline' : 'check_circle' }}</mat-icon>
    <h1 class="mol-confirmation__title">{{ headline(t) }}</h1>
    <p class="mol-amount">{{ t.amountMinor | minorAmount }}</p>

    <cn-card [padded]="true" class="mol-confirmation__card">
      <dl class="mol-dl">
        <dt i18n="@@transfers.confirm.number">Confirmation number</dt>
        <dd><code>{{ t.confirmationNumber }}</code></dd>
        <dt i18n="@@transfers.confirm.arrival">Expected arrival</dt>
        <dd>{{ t.estimatedArrival | date:'EEEE d MMMM' }}</dd>
        <dt *ngIf="t.feeMinor" i18n="@@transfers.review.fee">Fee</dt>
        <dd *ngIf="t.feeMinor">{{ t.feeMinor | minorAmount }}</dd>
        <dt *ngIf="t.frequency !== 'once'" i18n="@@transfers.confirm.repeats">Repeats</dt>
        <dd *ngIf="t.frequency !== 'once'">{{ t.frequency }}</dd>
        <dt *ngIf="t.failureCode" i18n="@@transfers.confirm.reason">Reason</dt>
        <dd *ngIf="t.failureCode">{{ 'errors.' + t.failureCode | translate }}</dd>
      </dl>
    </cn-card>

    <p class="mol-muted mol-small" *ngIf="t.status !== 'failed'" i18n="@@transfers.confirm.note">We have sent a confirmation to your alert channels. Scheduled transfers can be cancelled up to 5:00 PM Eastern the business day before.</p>

    <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="8px">
      <cn-button variant="primary" routerLink="/dashboard" i18n="@@action.done">Done</cn-button>
      <cn-button variant="secondary" routerLink="/transfers/new" i18n="@@transfers.confirm.another">Make another transfer</cn-button>
      <cn-button variant="tertiary" icon="print" (pressed)="print()" i18n="@@action.print">Print</cn-button>
    </div>
  </div>
</ng-container>
<ng-template #loading><mol-loading-panel [rows]="4"></mol-loading-panel></ng-template>
''')

# ---------------- payee list
w(f'{R}/payee-list/payee-list.component.ts', '''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CnDialogService, CnToastService } from '@meridian/canopy-ui/overlays';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Payee } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';

/** External transfer payees with verification status. */
@Component({
  selector: 'mol-payee-list',
  templateUrl: './payee-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayeeListComponent implements OnInit {
  payees$!: Observable<Payee[]>;
  error: AppError | null = null;
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private readonly api: TransfersApiService,
    private readonly router: Router,
    private readonly dialog: CnDialogService,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.payees$ = this.reload$.pipe(switchMap(() => this.api.payees()));
  }

  verify(p: Payee): void {
    void this.router.navigate(['/transfers/payees', p.payeeId, 'verify']);
  }

  remove(p: Payee): void {
    this.dialog
      .confirm({
        title: $localize`:@@transfers.payees.removeTitle:Remove ${p.nickname || p.name}:name:?`,
        message: $localize`:@@transfers.payees.removeBody:Scheduled transfers to this account will be cancelled. You can add it again later, but it will need verifying again.`,
        confirmLabel: $localize`:@@action.remove:Remove`,
        destructive: true
      })
      .subscribe(ok => {
        if (!ok) return;
        this.api.deletePayee(p.payeeId).subscribe({
          next: () => { this.toast.success($localize`:@@transfers.payees.removed:Account removed`); this.reload$.next(); },
          error: (err: AppError) => { this.error = err; this.cdr.markForCheck(); }
        });
      });
  }

  typeLabel(t: Payee['type']): string {
    return t === 'paylink' ? 'PayLink contact' : t === 'bill-pay' ? 'Bill payee' : 'External account';
  }

  trackById(_: number, p: Payee): string {
    return p.payeeId;
  }
}
''')
w(f'{R}/payee-list/payee-list.component.html', '''
<cn-page-header title="External accounts and people" i18n-title="@@transfers.payees.title" lede="Accounts at other banks and PayLink contacts you can send money to." i18n-lede="@@transfers.payees.lede" backLink="/transfers" backLabel="Transfers"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <mol-error-banner [error]="error" [showRetry]="false"></mol-error-banner>
  <div fxLayout="row" fxLayoutAlign="end">
    <cn-button variant="primary" icon="add" routerLink="new" i18n="@@transfers.payees.add">Add an external account</cn-button>
  </div>

  <ng-container *ngIf="payees$ | async as payees; else loading">
    <ul class="mol-payees" *ngIf="payees.length; else empty">
      <li *ngFor="let p of payees; trackBy: trackById" fxLayout="row" fxLayout.lt-md="column" fxLayoutAlign="space-between center" fxLayoutAlign.lt-md="start stretch" fxLayoutGap="12px">
        <div fxFlex fxLayout="column">
          <strong>{{ p.nickname || p.name }}</strong>
          <span class="mol-muted">{{ typeLabel(p.type) }} &middot; {{ p.name }} &middot; <mol-masked-number [last4]="p.accountNumberLastFour"></mol-masked-number></span>
        </div>
        <cn-badge [tone]="p.verified ? 'success' : 'caution'">{{ p.verified ? 'Verified' : 'Verification pending' }}</cn-badge>
        <div fxLayout="row" fxLayoutGap="4px">
          <cn-button *ngIf="!p.verified" variant="secondary" size="small" (pressed)="verify(p)" i18n="@@transfers.payees.verify">Enter deposits</cn-button>
          <cn-icon-button icon="delete" ariaLabel="Remove" (pressed)="remove(p)"></cn-icon-button>
        </div>
      </li>
    </ul>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="3"></mol-loading-panel></ng-template>
  <ng-template #empty>
    <mol-empty-state icon="people_outline" title="No external accounts yet" i18n-title="@@transfers.payees.empty" body="Add an account at another bank to move money in or out. Verification takes one to two business days." i18n-body="@@transfers.payees.emptyBody"></mol-empty-state>
  </ng-template>
</div>
''')
