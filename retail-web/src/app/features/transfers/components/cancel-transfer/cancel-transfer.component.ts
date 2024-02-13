import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { TransfersApiService } from '../../../../core/api/transfers-api.service';

export interface CancelTransferData {
  transferId: string;
}

/** Cancel confirmation for a scheduled transfer. */
@Component({
  selector: 'mol-cancel-transfer',
  templateUrl: './cancel-transfer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelTransferComponent {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<CancelTransferComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: CancelTransferData,
    private readonly api: TransfersApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    this.api.cancel(this.data.transferId).subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
