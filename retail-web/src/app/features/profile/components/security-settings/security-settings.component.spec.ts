import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTestConfig } from '../../../../../testing/test-config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AuthService } from '../../../../core/auth/auth.service';

import { SharedModule } from '../../../../shared/shared.module';
import { SecuritySettingsComponent } from './security-settings.component';

describe('SecuritySettingsComponent', () => {
  let fixture: ComponentFixture<SecuritySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecuritySettingsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideTestConfig(), { provide: AuthService, useValue: { claims: { email: 'dana.k@example.com' }, logout: jasmine.createSpy('logout') } }]
    }).compileComponents();

    fixture = TestBed.createComponent(SecuritySettingsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('describes each MFA method', () => {
    expect(fixture.componentInstance.mfaLabel('push')).toContain('Push');
    expect(fixture.componentInstance.username).toBe('dana.k@example.com');
  });
});
