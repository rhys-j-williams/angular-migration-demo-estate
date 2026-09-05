import { CdkTrapFocus } from '@angular/cdk/a11y';
import { AfterContentInit, Directive, Input } from '@angular/core';

/**
 * Focus trap with the Canopy defaults: focus is captured on attach and restored on detach.
 * Wraps `cdkTrapFocus` rather than re-implementing it so the dialog and bottom sheet behave the
 * same as any hand rolled overlay in a consuming application.
 *
 *   <div cnFocusTrap [cnFocusTrapDisabled]="!open">...</div>
 */
@Directive({
  selector: '[cnFocusTrap]',
  exportAs: 'cnFocusTrap',
  host: { class: 'cn-focus-trap' }
})
export class CnFocusTrapDirective extends CdkTrapFocus implements AfterContentInit {
  @Input()
  set cnFocusTrapDisabled(value: boolean) {
    this.enabled = !value;
  }
  get cnFocusTrapDisabled(): boolean {
    return !this.enabled;
  }

  override ngAfterContentInit(): void {
    this.autoCapture = true;
    super.ngAfterContentInit();
  }
}
