import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { DisclosuresRoutingModule } from './disclosures-routing.module';
import { DisclosureListComponent } from './components/disclosure-list/disclosure-list.component';
import { DisclosureViewerComponent } from './components/disclosure-viewer/disclosure-viewer.component';

/** Regulatory disclosures. Content versions come from the BFF; Legal owns the text (LGL-COMMS mailbox). */
@NgModule({
  declarations: [
    DisclosureListComponent,
    DisclosureViewerComponent
  ],
  imports: [
    SharedModule,
    DisclosuresRoutingModule
  ]
})
export class DisclosuresModule {}
