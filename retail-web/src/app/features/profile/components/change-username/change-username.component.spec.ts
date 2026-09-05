import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { ChangeUsernameComponent } from './change-username.component';

describe('ChangeUsernameComponent', () => {
  let fixture: ComponentFixture<ChangeUsernameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeUsernameComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { profile: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: ProfileApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeUsernameComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
