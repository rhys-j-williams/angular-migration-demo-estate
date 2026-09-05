import { Component } from '@angular/core';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-skeleton-page',
  template: `
    <cs-demo-page title="cn-skeleton" selector="cn-skeleton" importFrom="data-display" imports="CnSkeletonModule" lede="Loading placeholders in text, rect and circle shapes.">

  <cs-demo-section title="Account card loading" note="Skeleton shapes mirror the layout they stand in for. Animation respects prefers-reduced-motion.">
    <div class="cs-row" style="align-items: flex-start">
      <div style="width: 320px" class="cs-stack">
        <div class="cs-row"><cn-skeleton shape="circle" width="40px" height="40px"></cn-skeleton><cn-skeleton shape="text" [lines]="2" width="200px"></cn-skeleton></div>
        <cn-skeleton shape="rect" height="72px"></cn-skeleton>
        <cn-skeleton shape="text" [lines]="3"></cn-skeleton>
      </div>
      <div style="width: 320px">
        <cn-toggle [(ngModel)]="loading" labelPosition="after">Simulate loading</cn-toggle>
        <cn-skeleton *ngIf="loading" shape="rect" height="120px" label="Loading account"></cn-skeleton>
        <cn-account-card *ngIf="!loading" [account]="account"></cn-account-card>
      </div>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class SkeletonPageComponent {
  loading = true;
  readonly account = this.fixtures.summaries()[0];
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
