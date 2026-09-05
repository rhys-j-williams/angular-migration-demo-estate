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
