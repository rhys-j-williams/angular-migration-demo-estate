import { Component } from '@angular/core';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-tabs-page',
  template: `
    <cs-demo-page title="cn-tabs" selector="cn-tabs" importFrom="navigation" imports="CnTabsModule" lede="Lazy tab group with badges and icons on the labels.">

  <cs-demo-section title="Account detail" note="Bodies are templates and only instantiate when selected. The label and ink bar are restyled to brand.">
    <cn-tabs [selectedIndex]="index" ariaLabel="Account detail" (selectedChange)="index = $event; visits = visits + 1">
      <ng-template cnTab label="Activity" [badge]="rows.length" icon="cn:document">
        <cn-list [items]="activity" [dense]="true"></cn-list>
      </ng-template>
      <ng-template cnTab label="Details" icon="cn:info">
        <p>Routing 021000000 &middot; Account &bull;&bull;&bull;&bull; {{ account.last4 }}</p>
      </ng-template>
      <ng-template cnTab label="Statements" icon="cn:download">
        <p>Twelve months available. Older on request through Secure Messages.</p>
      </ng-template>
      <ng-template cnTab label="Disputes" [disabled]="true"></ng-template>
    </cn-tabs>
    <p class="cs-muted">index {{ index }}, {{ visits }} changes</p>
    <cn-tabs [stretch]="true" [selectedIndex]="0">
      <ng-template cnTab label="Stretched">Tabs fill the width</ng-template>
      <ng-template cnTab label="Second">Second body</ng-template>
    </cn-tabs>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class TabsPageComponent {
  index = 0;
  visits = 0;
  readonly account = this.fixtures.summaries()[0];
  readonly rows = this.fixtures.transactions(this.account.id).slice(0, 6);
  readonly activity = this.rows.map(r => ({ id: r.id, primary: r.description, secondary: r.category, meta: String(r.amount) }));
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
