import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTestConfig } from '../../../../../testing/test-config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SecuritySettings } from '../../../../core/api/models';
import { sessionFeatureKey } from '../../../../core/store/session';

import { SharedModule } from '../../../../shared/shared.module';
import { ProfileHomeComponent } from './profile-home.component';

describe('ProfileHomeComponent', () => {
  let fixture: ComponentFixture<ProfileHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileHomeComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideTestConfig(), provideMockStore({ initialState: { [sessionFeatureKey]: { profile: null } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileHomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('scores SMS MFA, stale passwords and failed sign-ins down', () => {
    const base: SecuritySettings = { mfaMethod: 'authenticator', mfaEnrolledAt: '2024-01-01', passwordChangedAt: '2026-06-01', trustedDevices: [], loginHistory: [] };
    const now = new Date('2026-09-05');
    expect(ProfileHomeComponent.posture(base, now).score).toBe(3);
    expect(ProfileHomeComponent.posture({ ...base, mfaMethod: 'sms' }, now).score).toBe(2);
    expect(ProfileHomeComponent.posture({ ...base, mfaMethod: 'sms', passwordChangedAt: '2024-01-01' }, now).score).toBe(1);
  });
});
