import { ComponentType } from '@angular/cdk/portal';
import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CnDialogSize } from './dialog-shell.component';
import { CnConfirmDialogComponent, CnConfirmDialogData } from './confirm-dialog.component';

export interface CnDialogOptions<D = unknown> extends Omit<MatDialogConfig<D>, 'panelClass' | 'width' | 'maxWidth'> {
  size?: CnDialogSize;
}

/**
 * Thin wrapper over MatDialog applying the Canopy panel class and size presets. `confirm()` covers
 * the common yes/no case without every app writing its own dialog component.
 */
@Injectable({ providedIn: 'root' })
export class CnDialogService {
  constructor(private readonly dialog: MatDialog) {}

  open<T, D = unknown, R = unknown>(component: ComponentType<T> | TemplateRef<T>, options: CnDialogOptions<D> = {}): MatDialogRef<T, R> {
    const { size = 'md', ...rest } = options;
    const config: MatDialogConfig<D> = {
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      ...rest,
      panelClass: ['cn-dialog-panel', `cn-dialog-panel--${size}`]
    };
    return component instanceof TemplateRef ? this.dialog.open<T, D, R>(component, config) : this.dialog.open<T, D, R>(component, config);
  }

  confirm(data: CnConfirmDialogData): Observable<boolean> {
    return this.open<CnConfirmDialogComponent, CnConfirmDialogData, boolean>(CnConfirmDialogComponent, {
      size: 'sm',
      data,
      disableClose: true
    })
      .afterClosed()
      .pipe(map(result => !!result));
  }

  closeAll(): void {
    this.dialog.closeAll();
  }
}
