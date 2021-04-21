import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { BillPayApiService } from '../../../../core/api/bill-pay-api.service';

export interface CancelPaymentData {
  paymentId: string;
}

/** Cancel a scheduled payment. */
@Component({
  selector: 'mol-cancel-payment',
  templateUrl: './cancel-payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelPaymentComponent {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<CancelPaymentComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: CancelPaymentData,
    private readonly api: BillPayApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    this.api.cancel(this.data.paymentId).subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
