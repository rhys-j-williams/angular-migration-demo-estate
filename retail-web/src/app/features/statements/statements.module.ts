import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { StatementsRoutingModule } from './statements-routing.module';
import { StatementsEffects } from './store/statements.effects';
import { statementsFeatureKey, statementsReducer } from './store/statements.reducer';
import { StatementListComponent } from './components/statement-list/statement-list.component';
import { TaxDocumentsComponent } from './components/tax-documents/tax-documents.component';
import { PaperlessSettingsComponent } from './components/paperless-settings/paperless-settings.component';
import { StatementViewerComponent } from './components/statement-viewer/statement-viewer.component';
import { DocumentSearchComponent } from './components/document-search/document-search.component';

/** Statements, tax documents and paperless preferences. PDFs are streamed from bff-retail, never cached by the SW. */
@NgModule({
  declarations: [
    StatementListComponent,
    TaxDocumentsComponent,
    PaperlessSettingsComponent,
    StatementViewerComponent,
    DocumentSearchComponent
  ],
  imports: [
    SharedModule,
    StatementsRoutingModule,
    StoreModule.forFeature(statementsFeatureKey, statementsReducer),
    EffectsModule.forFeature([StatementsEffects])
  ]
})
export class StatementsModule {}
