import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { sessionActions, sessionFeatureKey } from '../../../../core/store/session';
import { PromoBannerComponent } from './promo-banner.component';

describe('PromoBannerComponent', () => {
  let fixture: ComponentFixture<PromoBannerComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoBannerComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { [sessionFeatureKey]: { dismissedBanners: [] } } }),
        { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }
      ]
    }).compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PromoBannerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('records a dismissal in session state', () => {
    const spy = spyOn(store, 'dispatch');
    fixture.componentInstance.dismiss();
    expect(spy).toHaveBeenCalledWith(sessionActions.bannerDismissed({ bannerId: fixture.componentInstance.bannerId }));
  });
});
