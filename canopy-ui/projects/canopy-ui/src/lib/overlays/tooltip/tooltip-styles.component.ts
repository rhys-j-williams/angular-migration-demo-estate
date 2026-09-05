import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Carries the global tooltip stylesheet. Rendered once by cn-page-shell; directives cannot own
 * styles, and the theme file cannot be assumed to be present in every consumer.
 */
@Component({
  selector: 'cn-tooltip-styles',
  template: '',
  styleUrls: ['./tooltip.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CnTooltipStylesComponent {}
