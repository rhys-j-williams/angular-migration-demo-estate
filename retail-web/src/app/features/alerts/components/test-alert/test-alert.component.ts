import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { AlertsApiService } from '../../../../core/api/alerts-api.service';

export interface TestAlertData {
  channel: 'push' | 'sms' | 'email' | 'in-app';
}

/** Channel test dialog. */
@Component({
  selector: 'mol-test-alert',
  templateUrl: './test-alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestAlertComponent {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<TestAlertComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: TestAlertData,
    private readonly api: AlertsApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    this.api.sendTest(this.data.channel).subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
