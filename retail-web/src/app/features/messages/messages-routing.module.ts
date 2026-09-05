import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards';
import { ThreadListComponent } from './components/thread-list/thread-list.component';
import { ThreadViewComponent } from './components/thread-view/thread-view.component';
import { ComposeMessageComponent } from './components/compose-message/compose-message.component';

const routes: Routes = [
  { path: '', component: ThreadListComponent },
  { path: ':threadId', component: ThreadViewComponent },
  { path: 'new', component: ComposeMessageComponent, canDeactivate: [UnsavedChangesGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule {}
