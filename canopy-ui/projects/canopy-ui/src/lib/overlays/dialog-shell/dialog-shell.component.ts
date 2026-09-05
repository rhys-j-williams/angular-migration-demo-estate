import { ChangeDetectionStrategy, Component, EventEmitter, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export type CnDialogSize = 'sm' | 'md' | 'lg';

/**
 * Standard chrome for a dialog body: title row with close button, scrollable content, and an
 * actions row. Dialog components put this at their root:
 *
 *   <cn-dialog-shell title="Confirm transfer" [busy]="submitting" (closed)="ref.close()">
 *     ...form...
 *     <ng-container cnDialogActions>
 *       <cn-button variant="secondary" (pressed)="ref.close()">Cancel</cn-button>
 *       <cn-button variant="primary" (pressed)="confirm()">Transfer</cn-button>
 *     </ng-container>
 *   </cn-dialog-shell>
 *
 * Open dialogs with CnDialogService rather than MatDialog directly so the panel class, sizes and
 * focus restore behave consistently across apps.
 */
@Component({
  selector: 'cn-dialog-shell',
  templateUrl: './dialog-shell.component.html',
  styleUrls: ['./dialog-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-dialog-shell', '[class.cn-dialog-shell--busy]': 'busy', '[attr.data-cn-size]': 'size' }
})
export class CnDialogShellComponent {
  @Input() title = '';
  @Input() subtitle: string | null = null;
  @Input() showClose = true;
  @Input() busy = false;
  @Input() size: CnDialogSize = 'md';
  @Input() destructive = false;

  @Output() readonly closed = new EventEmitter<void>();

  constructor(@Optional() private readonly dialogRef: MatDialogRef<unknown> | null) {}

  close(): void {
    this.closed.emit();
    if (this.dialogRef && !this.closed.observed) {
      this.dialogRef.close();
    }
  }
}
