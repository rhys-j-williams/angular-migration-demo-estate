import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Horizontal or vertical rule with an optional centred label ("or", "Earlier").
 *
 *   <cn-divider label="Earlier this month"></cn-divider>
 */
@Component({
  selector: 'cn-divider',
  template: `
    <mat-divider *ngIf="!label" [vertical]="vertical" [inset]="inset"></mat-divider>
    <div *ngIf="label" class="cn-divider__labelled" role="separator" [attr.aria-label]="label">
      <span class="cn-divider__line" aria-hidden="true"></span>
      <span class="cn-divider__label">{{ label }}</span>
      <span class="cn-divider__line" aria-hidden="true"></span>
    </div>`,
  styleUrls: ['./divider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-divider', '[class.cn-divider--vertical]': 'vertical', '[attr.data-cn-spacing]': 'spacing' }
})
export class CnDividerComponent {
  @Input() label: string | null = null;
  @Input() vertical = false;
  @Input() inset = false;
  @Input() spacing: 'none' | 'sm' | 'md' | 'lg' = 'md';
}
