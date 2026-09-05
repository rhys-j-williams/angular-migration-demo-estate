import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountListComponent } from './account-list.component';

describe('AccountListComponent', () => {
  let fixture: ComponentFixture<AccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountListComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { accounts: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
