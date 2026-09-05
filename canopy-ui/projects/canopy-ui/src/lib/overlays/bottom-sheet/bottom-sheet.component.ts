import { ChangeDetectionStrategy, Component, EventEmitter, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

/**
 * Chrome for content opened in a MatBottomSheet: drag handle, title, close. Used on small
 * viewports where a dialog would be cramped (quick actions on an account, filter panels).
 * Open through CnBottomSheetService so the panel class is applied.
 */
@Component({
  selector: 'cn-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-bottom-sheet' }
})
export class CnBottomSheetComponent {
  @Input() title = '';
  @Input() showClose = true;

  @Output() readonly closed = new EventEmitter<void>();

  constructor(@Optional() private readonly sheetRef: MatBottomSheetRef<unknown> | null) {}

  close(): void {
    this.closed.emit();
    if (this.sheetRef && !this.closed.observed) {
      this.sheetRef.dismiss();
    }
  }
}
