import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { AuthService } from '../../../../core/auth/auth.service';
import { ConfigService } from '../../../../core/config/config.service';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { cardsFeatureKey } from '../../store/cards.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { CardDetailComponent } from './card-detail.component';

describe('CardDetailComponent', () => {
  let fixture: ComponentFixture<CardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardDetailComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [cardsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }), { provide: AuthService, useValue: { hasRecentMfa: () => false, stepUp: jasmine.createSpy('stepUp') } }, { provide: ConfigService, useValue: { value: { transfers: { mfaMaxAgeSeconds: 600 } } } }, { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('groups a PAN into blocks of four', () => {
    expect(fixture.componentInstance.grouped('1234567812345670')).toBe('1234 5678 1234 5670');
  });

  it('bounces through step-up before revealing without a fresh MFA claim', async () => {
    await fixture.componentInstance.reveal();
    expect(TestBed.inject(AuthService).stepUp).toHaveBeenCalled();
    expect(fixture.componentInstance.revealed).toBeNull();
  });
});
