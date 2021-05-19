import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { CardsApiService } from '../../../../core/api/cards-api.service';

export interface LockCardData {
  cardId: string;
  locked: boolean;
}

/** Lock/unlock confirmation. */
@Component({
  selector: 'mol-lock-card',
  templateUrl: './lock-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LockCardComponent {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<LockCardComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: LockCardData,
    private readonly api: CardsApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    this.api.lock(this.data.cardId, this.data.locked).subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
