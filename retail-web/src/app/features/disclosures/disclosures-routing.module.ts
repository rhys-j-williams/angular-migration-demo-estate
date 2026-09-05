import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisclosureListComponent } from './components/disclosure-list/disclosure-list.component';
import { DisclosureViewerComponent } from './components/disclosure-viewer/disclosure-viewer.component';

const routes: Routes = [
  { path: '', component: DisclosureListComponent },
  { path: ':key', component: DisclosureViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DisclosuresRoutingModule {}
