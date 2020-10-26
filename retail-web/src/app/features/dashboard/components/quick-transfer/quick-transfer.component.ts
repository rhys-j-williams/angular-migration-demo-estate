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
  amount: FormControl<number | null>;
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
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)])
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

  get amountMinor(): number {
    return Math.round((this.form.controls.amount.value ?? 0) * 100);
  }

  get overCap(): boolean {
    return this.amountMinor > this.capMinor;
  }

  get insufficient(): boolean {
    const src = this.accounts.find(a => a.accountId === this.form.controls.from.value);
    return !!src && this.amountMinor > src.availableBalanceMinor;
  }

  submit(): void {
    if (this.form.invalid || this.sameAccount || this.insufficient) {
      this.form.markAllAsTouched();
      return;
    }
    const { from, to } = this.form.getRawValue();
    const amountMinor = this.amountMinor;
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
        amountMinor,
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
