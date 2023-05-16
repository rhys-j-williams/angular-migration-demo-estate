import { Component } from '@angular/core';

@Component({
  selector: 'cs-disclosure-page',
  template: `
    <cs-demo-page title="cn-disclosure" selector="cn-disclosure" importFrom="content" imports="CnDisclosureModule, CnContentService" lede="Renders CMS-managed disclosure copy by key, inline HTML as a fallback.">

  <cs-demo-section title="By key" note="Content comes from the disclosures CMS through CnContentService. Without a CN_CONTENT_BASE_URL the service serves the bundled fallback copy, which is what you see here.">
    <cn-disclosure key="deposit-availability" heading="Funds availability"></cn-disclosure>
    <cn-disclosure key="does-not-exist" heading="Missing key" tone="muted"></cn-disclosure>
  </cs-demo-section>
  <cs-demo-section title="Inline HTML, tones, collapsible">
    <cn-disclosure heading="Overdraft" tone="boxed" html="<p>Standard overdraft coverage applies to checks and recurring debits. Card transactions are declined when funds are unavailable unless you opt in. Fee schedule in section 7 of the <a href='#'>Deposit Account Agreement</a>.</p>"></cn-disclosure>
    <cn-disclosure heading="Rate information" tone="muted" [collapsible]="true" [expanded]="open" html="<p>Rates are variable and may change after account opening. Fees may reduce earnings.</p>"></cn-disclosure>
    <cn-button variant="tertiary" size="small" (pressed)="open = !open">Toggle rate information</cn-button>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class DisclosurePageComponent {
  open = false;
}
