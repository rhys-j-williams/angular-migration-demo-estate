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
  /** Major units; CnCurrencyInput stores dollars. Converted to minor on commit. */
  amount: FormControl<number | null>;
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
    const { fromAccountId, amount } = g.getRawValue();
    const from = lookup(fromAccountId);
    if (!from || amount === null) return null;
    return Math.round(amount * 100) > from.availableBalanceMinor ? { insufficientFunds: { availableMinor: from.availableBalanceMinor } } : null;
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
      amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
      memo: this.fb.control('', [Validators.maxLength(60), Validators.pattern(/^[\w .,'&-]*$/)])
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
      type: d.type, fromAccountId: d.fromAccountId ?? '', toAccountId: d.toAccountId ?? '', payeeId: d.payeeId ?? '', amount: d.amountMinor === null ? null : d.amountMinor / 100, memo: d.memo
    });
    this.form.controls.type.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(type => this.applyType(type));
    this.applyType(d.type);
    // Park the amount continuously so a step-up mid flow never loses it.
    this.form.controls.amount.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.draft.patch({ amountMinor: this.amountMinor }));
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

  get amountMinor(): number | null {
    const v = this.form.controls.amount.value;
    return v === null ? null : Math.round(v * 100);
  }

  get overLimit(): boolean {
    const amt = this.amountMinor ?? 0;
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
      amountMinor: this.amountMinor,
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
