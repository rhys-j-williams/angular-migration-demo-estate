import { Directive, Input } from '@angular/core';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';

/**
 * Canopy tooltip. Wraps matTooltip with the house panel class, a sensible show delay and touch
 * gesture handling turned off (long-press on a balance was selecting text on Android).
 *
 *   <button cnTooltip="Available balance excludes pending transactions">...</button>
 *
 * Tooltips are not a substitute for a label; the element still needs an accessible name.
 */
@Directive({
  selector: '[cnTooltip]',
  exportAs: 'cnTooltip',
  providers: [MatTooltip]
})
export class CnTooltipDirective {
  constructor(private readonly matTooltip: MatTooltip) {
    this.matTooltip.tooltipClass = 'cn-tooltip';
    this.matTooltip.showDelay = 300;
    this.matTooltip.hideDelay = 0;
    this.matTooltip.touchGestures = 'off';
  }

  @Input('cnTooltip')
  set message(value: string) {
    this.matTooltip.message = value;
  }

  @Input('cnTooltipPosition')
  set position(value: TooltipPosition) {
    this.matTooltip.position = value;
  }

  @Input('cnTooltipDisabled')
  set disabled(value: boolean) {
    this.matTooltip.disabled = value;
  }

  show(): void {
    this.matTooltip.show();
  }

  hide(): void {
    this.matTooltip.hide();
  }
}
