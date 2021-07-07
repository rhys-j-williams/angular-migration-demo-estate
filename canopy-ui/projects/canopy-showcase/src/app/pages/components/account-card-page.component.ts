import { Component } from '@angular/core';
import { CnAccountSummary } from '@meridian/canopy-ui/data-display';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-account-card-page',
  template: `
    <cs-demo-page title="cn-account-card" selector="cn-account-card" importFrom="data-display" imports="CnAccountCardModule, CnAccountSummary" lede="Account tile with masked number, balance hide toggle and status.">

  <cs-demo-section title="Account overview" note="Only last4 ever reaches the component. Balance hide is per card and announced to screen readers.">
    <div class="cs-grid">
      <cn-account-card *ngFor="let a of accounts" [account]="a" [clickable]="true" (selected)="picked = $event.nickname"></cn-account-card>
    </div>
    <p class="cs-muted">Selected: {{ picked || 'none' }}</p>
  </cs-demo-section>
  <cs-demo-section title="Compact and statuses" note="Compact is used in the transfer picker. Frozen and pending render their status pill; closed drops the balance.">
    <div class="cs-grid">
      <cn-account-card [account]="frozen" [compact]="true"></cn-account-card>
      <cn-account-card [account]="pending" [compact]="true" [allowHideBalance]="false"></cn-account-card>
      <cn-account-card [account]="closed" [compact]="true"></cn-account-card>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class AccountCardPageComponent {
  picked = '';
  readonly accounts: CnAccountSummary[] = this.fixtures.summaries().slice(0, 3);
  readonly frozen: CnAccountSummary = { ...this.accounts[0], id: 'demo-frozen', nickname: 'Everyday Checking', status: 'frozen' };
  readonly pending: CnAccountSummary = { ...this.accounts[1], id: 'demo-pending', nickname: 'New Savings', status: 'pending', currentBalance: 0, availableBalance: 0 };
  readonly closed: CnAccountSummary = { ...this.accounts[2], id: 'demo-closed', nickname: 'Old Checking', status: 'closed' };
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
