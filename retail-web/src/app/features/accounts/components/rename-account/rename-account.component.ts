import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';

export interface RenameAccountData {
  accountId: string;
  nickname: string;
}

/** Nickname editor dialog. */
@Component({
  selector: 'mol-rename-account',
  templateUrl: './rename-account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenameAccountComponent {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<RenameAccountComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: RenameAccountData,
    private readonly api: AccountsApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    this.api.rename(this.data.accountId, this.data.nickname).subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
