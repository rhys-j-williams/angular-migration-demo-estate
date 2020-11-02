import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountsSummaryComponent } from './accounts-summary.component';

describe('AccountsSummaryComponent', () => {
  let fixture: ComponentFixture<AccountsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountsSummaryComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { dashboard: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsSummaryComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
