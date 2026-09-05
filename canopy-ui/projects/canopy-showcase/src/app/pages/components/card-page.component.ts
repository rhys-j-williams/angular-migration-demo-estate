import { Component } from '@angular/core';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-card-page',
  template: `
    <cs-demo-page title="cn-card" selector="cn-card" importFrom="data-display" imports="CnCardModule" lede="Content container with title, actions and footer slots.">

  <cs-demo-section title="Slots" note="cnCardAction projects into the header, cnCardFooter under the body. Heading level is configurable so page outlines stay correct.">
    <div class="cs-grid">
      <cn-card title="Upcoming payments" subtitle="Next 7 days" [headingLevel]="4">
        <cn-icon-button cnCardAction icon="cn:more" ariaLabel="More"></cn-icon-button>
        <cn-list [items]="payments" [dense]="true"></cn-list>
        <cn-button cnCardFooter variant="tertiary" size="small" icon="cn:arrow-right" iconPosition="end">All scheduled</cn-button>
      </cn-card>
      <cn-card title="Highlighted" [highlight]="true" [flat]="true">
        <p>Flat cards drop the shadow for nesting inside other cards. Highlight adds the brand rule at the top.</p>
      </cn-card>
      <cn-card [padded]="false">
        <img alt="" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'><rect width='400' height='120' fill='%23dfe9e3'/></svg>" style="display:block;width:100%">
        <div style="padding: 16px">Unpadded for media.</div>
      </cn-card>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class CardPageComponent {
  readonly payments = this.fixtures.payees.slice(0, 3).map((p, i) => ({
    id: p.payeeId, primary: p.name, secondary: p.nickname, meta: `in ${i + 2} days`
  }));
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
