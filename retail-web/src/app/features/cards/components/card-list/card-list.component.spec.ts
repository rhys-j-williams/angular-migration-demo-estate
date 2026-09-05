import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { Card } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { cardsFeatureKey } from '../../store/cards.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { CardListComponent } from './card-list.component';

describe('CardListComponent', () => {
  let fixture: ComponentFixture<CardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardListComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [cardsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }), { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(CardListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sorts active cards ahead of locked, expired and replaced ones', () => {
    const c = (cardId: string, status: Card['status']): Card => ({ cardId, customerId: 'c', accountId: 'a', cardNumber: '0000', network: 'meridian-debit', expiryMonth: 1, expiryYear: 2029, status, contactlessEnabled: true, digitalWallet: { applePay: false, googlePay: false, samsungPay: false } });
    const sorted = [c('1', 'replaced'), c('2', 'active'), c('3', 'locked')].sort(CardListComponent.byStatus);
    expect(sorted.map(x => x.cardId)).toEqual(['2', '3', '1']);
  });
});
