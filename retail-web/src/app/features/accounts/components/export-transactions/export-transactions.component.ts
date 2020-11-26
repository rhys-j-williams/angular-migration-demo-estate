import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';

export interface ExportTransactionsData {
  accountId: string;
  from?: string;
  to?: string;
}

/** CSV export confirmation. */
@Component({
  selector: 'mol-export-transactions',
  templateUrl: './export-transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportTransactionsComponent {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<ExportTransactionsComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ExportTransactionsData,
    private readonly api: AccountsApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    this.api.exportCsv({ accountId: this.data.accountId, from: this.data.from, to: this.data.to, page: 1, pageSize: 5000 }).subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
