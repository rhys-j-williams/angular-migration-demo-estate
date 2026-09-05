import { Component, Input } from '@angular/core';
import { CnBreadcrumb } from '@meridian/canopy-ui/layout';

/** Page frame every component page uses: header, import line, then the projected sections. */
@Component({
  selector: 'cs-demo-page',
  template: `
    <cn-page-header [title]="title" [eyebrow]="selector" [lede]="lede" [breadcrumbs]="crumbs">
      <cn-badge cnPageAction [tone]="status === 'stable' ? 'success' : status === 'deprecated' ? 'warn' : 'info'">{{ status }}</cn-badge>
    </cn-page-header>
    <pre class="cs-code" *ngIf="importFrom">import {{ '{' }} {{ imports }} {{ '}' }} from '@meridian/canopy-ui/{{ importFrom }}';</pre>
    <div class="cs-stack" style="margin-top: 24px">
      <ng-content></ng-content>
    </div>
  `
})
export class DemoPageComponent {
  @Input() title = '';
  @Input() selector = '';
  @Input() lede: string | null = null;
  @Input() importFrom = '';
  @Input() imports = '';
  @Input() status: 'stable' | 'beta' | 'deprecated' = 'stable';

  get crumbs(): CnBreadcrumb[] {
    return [{ label: 'Components', link: '/components/button' }, { label: this.selector || this.title }];
  }
}
