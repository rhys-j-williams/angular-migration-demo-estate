import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { CardsRoutingModule } from './cards-routing.module';
import { CardsEffects } from './store/cards.effects';
import { cardsFeatureKey, cardsReducer } from './store/cards.reducer';
import { CardListComponent } from './components/card-list/card-list.component';
import { CardDetailComponent } from './components/card-detail/card-detail.component';
import { CardControlsComponent } from './components/card-controls/card-controls.component';
import { LockCardComponent } from './components/lock-card/lock-card.component';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { TravelNoticeComponent } from './components/travel-notice/travel-notice.component';
import { ActivateCardComponent } from './components/activate-card/activate-card.component';

/** Debit and credit card servicing: lock, controls, travel notices, replacements. Some of this predates the RxJS 7 upgrade. */
@NgModule({
  declarations: [
    CardListComponent,
    CardDetailComponent,
    CardControlsComponent,
    LockCardComponent,
    ReportCardComponent,
    TravelNoticeComponent,
    ActivateCardComponent
  ],
  imports: [
    SharedModule,
    CardsRoutingModule,
    StoreModule.forFeature(cardsFeatureKey, cardsReducer),
    EffectsModule.forFeature([CardsEffects])
  ]
})
export class CardsModule {}
