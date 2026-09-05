import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { CardsApiService } from '../../../../core/api/cards-api.service';
import { ReportCardComponent } from './report-card.component';

describe('ReportCardComponent', () => {
  let fixture: ComponentFixture<ReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportCardComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { cards: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: CardsApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
