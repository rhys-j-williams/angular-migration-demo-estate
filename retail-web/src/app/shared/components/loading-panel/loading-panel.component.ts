import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Skeleton rows while a list loads. `rows` controls height so the layout does not jump. */
@Component({
  selector: 'mol-loading-panel',
  template: `
    <div class="mol-loading" [attr.aria-label]="label" role="progressbar" aria-busy="true">
      <cn-skeleton *ngFor="let r of rowArray" shape="text" [lines]="1" [animated]="true"></cn-skeleton>
    </div>
  `,
  styles: [`.mol-loading { display: grid; gap: 12px; padding: 8px 0; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingPanelComponent {
  @Input() rows = 4;
  @Input() label = 'Loading';

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
