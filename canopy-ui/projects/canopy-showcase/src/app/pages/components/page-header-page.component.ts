import { Component } from '@angular/core';
import { CnBreadcrumb } from '@meridian/canopy-ui/layout';

@Component({
  selector: 'cs-page-header-page',
  template: `
    <cs-demo-page title="cn-page-header" selector="cn-page-header" importFrom="layout" imports="CnPageHeaderModule" lede="Title block with eyebrow, lede, breadcrumbs, back link and actions.">

  <cs-demo-section title="Full" note="Actions project through cnPageAction and lay out with flex so they wrap under the title on narrow screens.">
    <cn-page-header title="Everyday Checking" eyebrow="Accounts" lede="Balance and activity for the last 90 days." [breadcrumbs]="crumbs">
      <cn-button cnPageAction variant="secondary" icon="cn:download">Statement</cn-button>
      <cn-button cnPageAction variant="primary" icon="cn:transfer">Transfer</cn-button>
    </cn-page-header>
  </cs-demo-section>
  <cs-demo-section title="Compact with back link">
    <cn-page-header title="Dispute a transaction" [compact]="true" backLink="/components/data-table" backLabel="Back to activity"></cn-page-header>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class PageHeaderPageComponent {
  readonly crumbs: CnBreadcrumb[] = [{ label: 'Home', link: '/' }, { label: 'Accounts', link: '/dashboard' }, { label: 'Everyday Checking' }];
}
