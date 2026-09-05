import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';

import { CnDialogService } from '@meridian/canopy-ui/overlays';

/** Implemented by any routed component that holds a form the customer might lose. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  /** Optional copy override; the default wording is generic. */
  unsavedChangesMessage?(): string;
}

/**
 * Asks before navigating away from a dirty form. Used on the transfer wizard, payee editor, profile
 * pages and the secure message composer. Uses the Canopy confirm dialog so the wording and focus
 * handling match the rest of the app; the browser's beforeunload prompt is handled separately in
 * AppComponent because that one cannot be styled.
 */
@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
  constructor(private readonly dialog: CnDialogService) {}

  canDeactivate(component: HasUnsavedChanges | null): Observable<boolean> {
    if (!component || typeof component.hasUnsavedChanges !== 'function' || !component.hasUnsavedChanges()) {
      return of(true);
    }
    const body = component.unsavedChangesMessage?.()
      ?? $localize`:@@unsaved.body:You have changes on this page that have not been saved. If you leave now they will be lost.`;
    return this.dialog.confirm({
      title: $localize`:@@unsaved.title:Leave without saving?`,
      message: body,
      confirmLabel: $localize`:@@unsaved.leave:Leave page`,
      cancelLabel: $localize`:@@unsaved.stay:Stay`,
      destructive: true
    });
  }
}
