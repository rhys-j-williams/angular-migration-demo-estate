import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

export type CnSkeletonShape = 'text' | 'heading' | 'circle' | 'rect' | 'card' | 'row';

/**
 * Loading placeholder. `lines` for text blocks, `shape` for everything else. Announces "Loading"
 * once via aria-busy on the host; do not also show a spinner.
 *
 *   <cn-skeleton shape="card"></cn-skeleton>
 *   <cn-skeleton [lines]="3"></cn-skeleton>
 */
@Component({
  selector: 'cn-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cn-skeleton',
    role: 'status',
    'aria-busy': 'true',
    'aria-live': 'polite',
    '[attr.data-cn-shape]': 'shape',
    '[class.cn-skeleton--static]': '!animated'
  }
})
export class CnSkeletonComponent {
  @Input() shape: CnSkeletonShape = 'text';
  @Input() lines = 1;
  @Input() width: string | null = null;
  @Input() height: string | null = null;
  @Input() animated = true;
  @Input() label = 'Loading';

  get lineArray(): number[] {
    return Array.from({ length: Math.max(1, this.lines) }, (_, i) => i);
  }
}
