import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Titled section with optional action slot. The building block of every feature page. */
@Component({
  selector: 'mol-page-section',
  template: `
    <section class="mol-section" [attr.aria-labelledby]="headingId">
      <header class="mol-section__head" fxLayout="row" fxLayout.lt-md="column" fxLayoutAlign="space-between center" fxLayoutAlign.lt-md="start start" fxLayoutGap="8px">
        <div>
          <h2 class="mol-section__title" [id]="headingId">{{ title }}</h2>
          <p class="mol-section__lede" *ngIf="lede">{{ lede }}</p>
        </div>
        <div class="mol-section__actions"><ng-content select="[molSectionAction]"></ng-content></div>
      </header>
      <ng-content></ng-content>
    </section>
  `,
  styles: [`
    .mol-section { margin-bottom: 24px; }
    .mol-section__head { margin-bottom: 12px; }
    .mol-section__title { margin: 0; font-size: 1.15rem; font-weight: 500; }
    .mol-section__lede { margin: 4px 0 0; color: var(--cn-color-text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSectionComponent {
  private static counter = 0;
  @Input() title = '';
  @Input() lede: string | null = null;
  readonly headingId = `mol-section-${++PageSectionComponent.counter}`;
}
