import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

export interface CnBreadcrumb {
  label: string;
  /** Router link; omitted for the current page. */
  link?: string | unknown[];
}

/**
 * Page title block: breadcrumbs, h1, optional lede and a right-hand action slot. Every routed page
 * in the consumer apps starts with one so the h1 lands in a consistent place for screen readers.
 *
 *   <cn-page-header title="Transfers" lede="Move money between your accounts" [breadcrumbs]="crumbs">
 *     <cn-button cnPageAction variant="primary">New transfer</cn-button>
 *   </cn-page-header>
 */
@Component({
  selector: 'cn-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-page-header', '[class.cn-page-header--compact]': 'compact' }
})
export class CnPageHeaderComponent {
  @Input() title = '';
  @Input() lede: string | null = null;
  @Input() eyebrow: string | null = null;
  @Input() breadcrumbs: CnBreadcrumb[] = [];
  @Input() compact = false;
  @Input() backLink: string | unknown[] | null = null;
  @Input() backLabel = 'Back';
}
