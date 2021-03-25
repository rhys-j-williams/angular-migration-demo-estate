import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

export type CnBadgeTone = 'neutral' | 'info' | 'success' | 'caution' | 'warn' | 'brand';

/**
 * Inline status pill. Not to be confused with mat-badge (the little count dot), which
 * cn-icon-button wraps. Text only; if you need an icon, project it.
 *
 *   <cn-badge tone="success">Posted</cn-badge>
 */
@Component({
  selector: 'cn-badge',
  template: `<span class="cn-badge__dot" *ngIf="dot" aria-hidden="true"></span><ng-content></ng-content>`,
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cn-badge',
    '[attr.data-cn-tone]': 'tone',
    '[class.cn-badge--outline]': 'outline',
    '[class.cn-badge--small]': 'size === "small"'
  }
})
export class CnBadgeComponent {
  @Input() tone: CnBadgeTone = 'neutral';
  @Input() outline = false;
  @Input() dot = false;
  @Input() size: 'default' | 'small' = 'default';
}
