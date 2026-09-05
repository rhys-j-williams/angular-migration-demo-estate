import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { ContactDetailsComponent } from './contact-details.component';

describe('ContactDetailsComponent', () => {
  let fixture: ComponentFixture<ContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactDetailsComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { profile: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: ProfileApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
