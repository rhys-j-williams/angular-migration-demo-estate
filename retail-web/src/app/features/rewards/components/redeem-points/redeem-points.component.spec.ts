import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { RewardsApiService } from '../../../../core/api/rewards-api.service';
import { RedeemPointsComponent } from './redeem-points.component';

describe('RedeemPointsComponent', () => {
  let fixture: ComponentFixture<RedeemPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedeemPointsComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { rewards: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: RewardsApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RedeemPointsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
