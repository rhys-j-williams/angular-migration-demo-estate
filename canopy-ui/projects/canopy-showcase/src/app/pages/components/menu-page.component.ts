import { Component } from '@angular/core';
import { CnMenuItem } from '@meridian/canopy-ui/actions';

@Component({
  selector: 'cs-menu-page',
  template: `
    <cs-demo-page title="cn-menu" selector="cn-menu" importFrom="actions" imports="CnMenuModule, CnMenuItem" lede="Overflow action menu with dividers and destructive items.">

  <cs-demo-section title="Account actions" note="The same item list the dashboard uses on each account card. Destructive items sit at the bottom by convention.">
    <div class="cs-row">
      <cn-menu [items]="items" triggerLabel="Account actions" (selected)="selected = $event.label"></cn-menu>
      <cn-menu [items]="items" triggerLabel="Text trigger" triggerIcon="cn:chevron-down" xPosition="after"></cn-menu>
    </div>
    <p class="cs-muted">Selected: {{ selected || 'nothing yet' }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class MenuPageComponent {
  selected = '';
  readonly items: CnMenuItem[] = [
    { id: 'statements', label: 'View statements', icon: 'cn:document' },
    { id: 'nickname', label: 'Rename account', icon: 'cn:settings' },
    { id: 'alerts', label: 'Manage alerts', icon: 'cn:bell', disabled: true },
    { id: 'freeze', label: 'Freeze card', icon: 'cn:lock', dividerBefore: true, destructive: true }
  ];
}
