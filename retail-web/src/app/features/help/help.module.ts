import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { HelpRoutingModule } from './help-routing.module';
import { HelpHomeComponent } from './components/help-home/help-home.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

/** Help centre. Public. Content from the BFF's CMS proxy. */
@NgModule({
  declarations: [
    HelpHomeComponent,
    FaqComponent,
    ContactUsComponent
  ],
  imports: [
    SharedModule,
    HelpRoutingModule
  ]
})
export class HelpModule {}
