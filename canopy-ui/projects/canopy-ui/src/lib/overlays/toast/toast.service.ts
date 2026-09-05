import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { CnToastComponent, CnToastData } from './toast.component';

export type CnToastTone = 'neutral' | 'success' | 'caution' | 'error';

export interface CnToastOptions {
  tone?: CnToastTone;
  action?: string;
  /** ms; 0 keeps it open until dismissed. Errors default to sticky. */
  duration?: number;
  /** Fallback to Material's plain text snackbar (no icon, no tone). */
  simple?: boolean;
}

/**
 * Transient notifications. `success` after a transfer posts, `error` when it fails; `caution`
 * for things like session expiry warnings. Errors are sticky by default because customers
 * screenshot them for support. Only one toast shows at a time; a new one replaces the old.
 *
 *   this.toast.success('Transfer scheduled for Mar 14');
 *   this.toast.error('Could not reach the payments service', { action: 'Retry' }).onAction().subscribe(...)
 */
@Injectable({ providedIn: 'root' })
export class CnToastService {
  constructor(private readonly snackBar: MatSnackBar) {}

  show(message: string, options: CnToastOptions = {}): MatSnackBarRef<CnToastComponent> | MatSnackBarRef<unknown> {
    const tone = options.tone ?? 'neutral';
    const duration = options.duration ?? (tone === 'error' ? 0 : 5000);
    const panelClass = ['cn-toast', `cn-toast--${tone}`];
    if (options.simple) {
      return this.snackBar.open(message, options.action, { duration, panelClass, politeness: tone === 'error' ? 'assertive' : 'polite' });
    }
    const data: CnToastData = { message, tone, action: options.action };
    return this.snackBar.openFromComponent(CnToastComponent, {
      data,
      duration,
      panelClass,
      politeness: tone === 'error' ? 'assertive' : 'polite',
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  success(message: string, options: Omit<CnToastOptions, 'tone'> = {}): MatSnackBarRef<CnToastComponent> | MatSnackBarRef<unknown> {
    return this.show(message, { ...options, tone: 'success' });
  }

  caution(message: string, options: Omit<CnToastOptions, 'tone'> = {}): MatSnackBarRef<CnToastComponent> | MatSnackBarRef<unknown> {
    return this.show(message, { ...options, tone: 'caution' });
  }

  error(message: string, options: Omit<CnToastOptions, 'tone'> = {}): MatSnackBarRef<CnToastComponent> | MatSnackBarRef<unknown> {
    return this.show(message, { ...options, tone: 'error' });
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }
}
