import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

export type CnProgressTone = 'brand' | 'success' | 'caution' | 'warn';

/**
 * Determinate or indeterminate progress. Linear bar by default; `circular` for inline spinners.
 * The bar changes tone above thresholds when `thresholds` is set, e.g. budget usage:
 *
 *   <cn-progress [value]="spent / budget * 100" label="Dining budget" [thresholds]="{ caution: 80, warn: 100 }"></cn-progress>
 */
@Component({
  selector: 'cn-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-progress', '[attr.data-cn-tone]': 'effectiveTone', '[class.cn-progress--circular]': 'circular' }
})
export class CnProgressComponent {
  @Input() value: number | null = null;
  @Input() label: string | null = null;
  @Input() showValue = false;
  @Input() circular = false;
  @Input() diameter = 32;
  @Input() tone: CnProgressTone = 'brand';
  @Input() thresholds: { caution?: number; warn?: number } | null = null;

  get mode(): 'determinate' | 'indeterminate' {
    return this.value === null ? 'indeterminate' : 'determinate';
  }

  get clamped(): number {
    return Math.max(0, Math.min(100, this.value ?? 0));
  }

  get effectiveTone(): CnProgressTone {
    if (this.thresholds && this.value !== null) {
      if (this.thresholds.warn !== undefined && this.value >= this.thresholds.warn) {
        return 'warn';
      }
      if (this.thresholds.caution !== undefined && this.value >= this.thresholds.caution) {
        return 'caution';
      }
    }
    return this.tone;
  }
}
