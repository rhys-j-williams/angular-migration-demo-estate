import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { CardsApiService } from '../../../../core/api/cards-api.service';
import { TravelNoticeComponent } from './travel-notice.component';

describe('TravelNoticeComponent', () => {
  let fixture: ComponentFixture<TravelNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravelNoticeComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { cards: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: CardsApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TravelNoticeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
