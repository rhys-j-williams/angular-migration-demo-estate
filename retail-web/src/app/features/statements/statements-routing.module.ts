import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatementListComponent } from './components/statement-list/statement-list.component';
import { TaxDocumentsComponent } from './components/tax-documents/tax-documents.component';
import { PaperlessSettingsComponent } from './components/paperless-settings/paperless-settings.component';
import { StatementViewerComponent } from './components/statement-viewer/statement-viewer.component';

const routes: Routes = [
  { path: '', component: StatementListComponent },
  { path: 'tax', component: TaxDocumentsComponent },
  { path: 'paperless', component: PaperlessSettingsComponent },
  { path: ':statementId', component: StatementViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatementsRoutingModule {}
