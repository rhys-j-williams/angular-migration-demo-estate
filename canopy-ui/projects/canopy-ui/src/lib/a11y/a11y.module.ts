import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { CnA11yAnnouncerComponent } from './announcer.component';
import { CnFocusTrapDirective } from './focus-trap.directive';
import { CnSkipLinkDirective } from './skip-link.directive';

@NgModule({
  imports: [A11yModule],
  declarations: [CnA11yAnnouncerComponent, CnFocusTrapDirective, CnSkipLinkDirective],
  exports: [A11yModule, CnA11yAnnouncerComponent, CnFocusTrapDirective, CnSkipLinkDirective]
})
export class CnA11yModule {}
