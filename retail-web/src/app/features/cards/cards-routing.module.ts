import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards';
import { CardListComponent } from './components/card-list/card-list.component';
import { CardDetailComponent } from './components/card-detail/card-detail.component';
import { CardControlsComponent } from './components/card-controls/card-controls.component';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { TravelNoticeComponent } from './components/travel-notice/travel-notice.component';
import { ActivateCardComponent } from './components/activate-card/activate-card.component';

const routes: Routes = [
  { path: '', component: CardListComponent },
  { path: ':cardId', component: CardDetailComponent },
  { path: ':cardId/controls', component: CardControlsComponent },
  { path: ':cardId/report', component: ReportCardComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: ':cardId/travel', component: TravelNoticeComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: ':cardId/activate', component: ActivateCardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule {}
