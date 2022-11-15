import { Component } from '@angular/core';
import { CnA11yAnnouncerService } from '@meridian/canopy-ui/a11y';

@Component({
  selector: 'cs-a11y-announcer-page',
  template: `
    <cs-demo-page title="cn-a11y-announcer" selector="cn-a11y-announcer" importFrom="a11y" imports="CnA11yModule, CnA11yAnnouncerService" lede="Live region announcements, focus trap and skip link directives.">

  <cs-demo-section title="Announcer" note="Wraps the CDK LiveAnnouncer with the politeness defaults the accessibility team agreed. Use a screen reader to hear these.">
    <div class="cs-row">
      <cn-button variant="secondary" (pressed)="announce('polite')">Polite: balance updated</cn-button>
      <cn-button variant="secondary" (pressed)="announce('assertive')">Assertive: session expiring</cn-button>
    </div>
    <p class="cs-muted">Last: {{ last || '-' }}</p>
  </cs-demo-section>
  <cs-demo-section title="cnFocusTrap" note="Tab cycles inside the box while the trap is enabled. Dialogs and the bottom sheet use this through Material, forms on their own use the directive.">
    <cn-toggle [(ngModel)]="trapped" labelPosition="after">Trap enabled</cn-toggle>
    <div cnFocusTrap [cnFocusTrapDisabled]="!trapped" class="cs-trap" [class.cs-trap--on]="trapped">
      <cn-button variant="secondary">One</cn-button>
      <cn-button variant="secondary">Two</cn-button>
      <cn-button variant="secondary">Three</cn-button>
    </div>
  </cs-demo-section>
  <cs-demo-section title="cnSkipLink" note="The shell renders one before the toolbar. Tab from the address bar to see it.">
    <pre class="cs-code">&lt;a cnSkipLink="main-content"&gt;Skip to main content&lt;/a&gt;</pre>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class A11yAnnouncerPageComponent {
  last = '';
  trapped = false;
  announce(kind: 'polite' | 'assertive'): void {
    const msg = kind === 'polite' ? 'Available balance updated' : 'Your session expires in one minute';
    this.announcer.announce(msg, kind);
    this.last = `${kind}: ${msg}`;
  }
  constructor(private readonly announcer: CnA11yAnnouncerService) {}
}
