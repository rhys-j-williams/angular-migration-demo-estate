import { Component } from '@angular/core';

@Component({
  selector: 'cs-badge-page',
  template: `
    <cs-demo-page title="cn-badge" selector="cn-badge" importFrom="data-display" imports="CnBadgeModule" lede="Status pill in five tones, outline and dot variants.">

  <cs-demo-section title="Tones" note="Tone carries meaning and colour; the text must still make sense without it.">
    <div class="cs-row">
      <cn-badge tone="neutral">Scheduled</cn-badge>
      <cn-badge tone="info">Pending</cn-badge>
      <cn-badge tone="success">Posted</cn-badge>
      <cn-badge tone="caution">Needs review</cn-badge>
      <cn-badge tone="warn">Declined</cn-badge>
    </div>
  </cs-demo-section>
  <cs-demo-section title="Outline, dot and small" note="Dot badges go next to account nicknames in dense lists.">
    <div class="cs-row">
      <cn-badge tone="success" [outline]="true">Verified</cn-badge>
      <cn-badge tone="warn" [dot]="true">Frozen</cn-badge>
      <cn-badge tone="info" size="small">3 new</cn-badge>
      <cn-badge tone="caution" [outline]="true" size="small" [dot]="true">Hold</cn-badge>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class BadgePageComponent {
}
