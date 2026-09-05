import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface CnConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@Component({
  selector: 'cn-confirm-dialog',
  template: `
    <cn-dialog-shell [title]="data.title" size="sm" [destructive]="!!data.destructive" [showClose]="false">
      <p class="cn-confirm-dialog__message">{{ data.message }}</p>
      <ng-container cnDialogActions>
        <button mat-stroked-button type="button" (click)="ref.close(false)">{{ data.cancelLabel || 'Cancel' }}</button>
        <button mat-flat-button type="button" class="cn-confirm-dialog__confirm" [color]="data.destructive ? 'warn' : 'primary'" cdkFocusInitial (click)="ref.close(true)">
          {{ data.confirmLabel || 'Confirm' }}
        </button>
      </ng-container>
    </cn-dialog-shell>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CnConfirmDialogComponent {
  constructor(public readonly ref: MatDialogRef<CnConfirmDialogComponent, boolean>, @Inject(MAT_DIALOG_DATA) public readonly data: CnConfirmDialogData) {}
}
