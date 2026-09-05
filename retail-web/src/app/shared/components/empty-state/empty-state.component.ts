import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'mol-empty-state',
  template: `
    <div class="mol-empty" fxLayout="column" fxLayoutAlign="center center" fxLayoutGap="8px" role="status">
      <mat-icon *ngIf="icon" class="mol-empty__icon" aria-hidden="true">{{ icon }}</mat-icon>
      <h3 class="mol-empty__title">{{ title }}</h3>
      <p class="mol-empty__body" *ngIf="body">{{ body }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .mol-empty { padding: 32px 16px; text-align: center; color: var(--cn-color-text-muted); }
    .mol-empty__icon { font-size: 40px; width: 40px; height: 40px; }
    .mol-empty__title { margin: 0; font-size: 1.1rem; color: var(--cn-color-text); }
    .mol-empty__body { margin: 0; max-width: 42ch; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon: string | null = 'inbox';
  @Input() title = '';
  @Input() body: string | null = null;
}
