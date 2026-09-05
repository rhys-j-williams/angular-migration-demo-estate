import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { GenericErrorComponent } from './components/generic-error/generic-error.component';

const routes: Routes = [
  { path: 'not-found', component: NotFoundComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'error', component: GenericErrorComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorsRoutingModule {}
