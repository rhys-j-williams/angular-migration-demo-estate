import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ErrorsRoutingModule } from './errors-routing.module';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { GenericErrorComponent } from './components/generic-error/generic-error.component';

/** Not found, forbidden and generic error pages. Wildcard route lives here. */
@NgModule({
  declarations: [
    NotFoundComponent,
    ForbiddenComponent,
    GenericErrorComponent
  ],
  imports: [
    SharedModule,
    ErrorsRoutingModule
  ]
})
export class ErrorsModule {}
