import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface CnToastData {
  message: string;
  tone: 'neutral' | 'success' | 'caution' | 'error';
  action?: string;
}

const TONE_ICON: Record<CnToastData['tone'], string> = {
  neutral: 'cn:info',
  success: 'cn:check',
  caution: 'cn:alert',
  error: 'cn:alert'
};

/** Snackbar body rendered by CnToastService. Not used directly. */
@Component({
  selector: 'cn-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-toast__body', '[attr.data-cn-tone]': 'data.tone' }
})
export class CnToastComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public readonly data: CnToastData, private readonly ref: MatSnackBarRef<CnToastComponent>) {}

  get icon(): string {
    return TONE_ICON[this.data.tone];
  }

  act(): void {
    this.ref.dismissWithAction();
  }

  dismiss(): void {
    this.ref.dismiss();
  }
}
