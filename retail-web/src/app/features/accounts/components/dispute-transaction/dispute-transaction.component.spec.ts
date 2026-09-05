import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { DisputeTransactionComponent } from './dispute-transaction.component';

describe('DisputeTransactionComponent', () => {
  let fixture: ComponentFixture<DisputeTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisputeTransactionComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { accounts: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: AccountsApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DisputeTransactionComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
