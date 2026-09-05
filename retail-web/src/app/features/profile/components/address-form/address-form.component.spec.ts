import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { AddressFormComponent } from './address-form.component';

describe('AddressFormComponent', () => {
  let fixture: ComponentFixture<AddressFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressFormComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { profile: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: ProfileApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressFormComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
