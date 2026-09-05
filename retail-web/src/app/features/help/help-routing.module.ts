import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HelpHomeComponent } from './components/help-home/help-home.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

const routes: Routes = [
  { path: '', component: HelpHomeComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'contact', component: ContactUsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule {}
