import { Component } from '@angular/core';

@Component({
  selector: 'cs-icon-button-page',
  template: `
    <cs-demo-page title="cn-icon-button" selector="cn-icon-button" importFrom="actions" imports="CnIconButtonModule" lede="Icon-only button with a mandatory aria-label, optional tooltip and badge.">

  <cs-demo-section title="Basics" note="ariaLabel is required. The tooltip defaults to the label if you do not set one.">
    <div class="cs-row">
      <cn-icon-button icon="cn:search" ariaLabel="Search transactions" (pressed)="count = count + 1"></cn-icon-button>
      <cn-icon-button icon="cn:filter" ariaLabel="Filter" tooltip="Filter this list"></cn-icon-button>
      <cn-icon-button icon="cn:download" ariaLabel="Download statement" color="primary"></cn-icon-button>
      <cn-icon-button icon="cn:close" ariaLabel="Dismiss" [disabled]="true"></cn-icon-button>
    </div>
    <p class="cs-muted">Pressed {{ count }} times</p>
  </cs-demo-section>
  <cs-demo-section title="Badges" note="Used for the notification bell in the page shell toolbar. Badge hides when the count drops to zero.">
    <div class="cs-row">
      <cn-icon-button icon="cn:bell" ariaLabel="Notifications" [badge]="alerts" [badgeHidden]="alerts === 0" tooltip="{{ alerts }} unread alerts"></cn-icon-button>
      <cn-button variant="tertiary" size="small" (pressed)="alerts = alerts + 1">Add alert</cn-button>
      <cn-button variant="tertiary" size="small" (pressed)="alerts = 0">Clear</cn-button>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class IconButtonPageComponent {
  count = 0;
  alerts = 3;
}
