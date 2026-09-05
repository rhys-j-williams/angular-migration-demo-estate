import { ComponentType } from '@angular/cdk/portal';
import { Injectable, TemplateRef } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Injectable({ providedIn: 'root' })
export class CnBottomSheetService {
  constructor(private readonly sheet: MatBottomSheet) {}

  open<T, D = unknown, R = unknown>(component: ComponentType<T> | TemplateRef<T>, config: Omit<MatBottomSheetConfig<D>, 'panelClass'> = {}): MatBottomSheetRef<T, R> {
    const merged: MatBottomSheetConfig<D> = { restoreFocus: true, ...config, panelClass: 'cn-bottom-sheet-panel' };
    return component instanceof TemplateRef
      ? this.sheet.open<T, D, R>(component, merged)
      : this.sheet.open<T, D, R>(component, merged);
  }

  dismiss(): void {
    this.sheet.dismiss();
  }
}
