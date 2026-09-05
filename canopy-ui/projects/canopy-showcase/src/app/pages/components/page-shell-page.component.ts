import { Component } from '@angular/core';
import { CnNavItem } from '@meridian/canopy-ui/layout';

@Component({
  selector: 'cs-page-shell-page',
  template: `
    <cs-demo-page title="cn-page-shell" selector="cn-page-shell" importFrom="layout" imports="CnPageShellModule, CnNavItem" lede="Application frame: toolbar, responsive nav drawer, skip link, theme toggle.">

  <cs-demo-section title="This showcase is inside one" note="The shell owns the header, nav and main landmark. Resize the window to see the drawer take over below 960px; collapse the nav with the toolbar button.">
    <p>The showcase itself renders inside <code>cn-page-shell</code>, so the live example is the page around this card. Nav items:</p>
    <pre class="cs-code">{{ nav | json }}</pre>
  </cs-demo-section>
  <cs-demo-section title="Embedded, collapsed nav" [tinted]="true">
    <div style="height: 360px; border: 1px solid var(--cn-color-border); overflow: hidden">
      <cn-page-shell appName="Meridian Business" environmentLabel="UAT" [nav]="nav" userName="Demo User" [navCollapsed]="true" [showThemeToggle]="true"
                     (navSelect)="last = $event.label" (signOut)="last = 'sign out'">
        <cn-icon-button cnShellToolbar icon="cn:bell" ariaLabel="Notifications" [badge]="2"></cn-icon-button>
        <p style="padding: 16px">Content area. Last nav event: {{ last || '-' }}</p>
      </cn-page-shell>
    </div>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class PageShellPageComponent {
  last = '';
  readonly nav: CnNavItem[] = [
    { id: 'home', label: 'Overview', icon: 'cn:home' },
    { id: 'payments', label: 'Payments', icon: 'cn:transfer', badge: 2 },
    { id: 'reports', label: 'Reports', icon: 'cn:document', children: [{ id: 'r1', label: 'Cash position' }, { id: 'r2', label: 'ACH returns' }] },
    { id: 'admin', label: 'Administration', icon: 'cn:settings', disabled: true }
  ];
}
