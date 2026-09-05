import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AuthService } from '../../../../core/auth/auth.service';
import { ConfigService } from '../../../../core/config/config.service';
import { LanternService } from '../../../../core/telemetry/lantern.service';

import { SharedModule } from '../../../../shared/shared.module';
import { MfaSettingsComponent } from './mfa-settings.component';

describe('MfaSettingsComponent', () => {
  let fixture: ComponentFixture<MfaSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MfaSettingsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: { hasRecentMfa: () => false, stepUp: jasmine.createSpy('stepUp') } }, { provide: ConfigService, useValue: { value: { transfers: { mfaMaxAgeSeconds: 600 } } } }, { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(MfaSettingsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sends the customer through step-up when the MFA claim is stale', () => {
    const c = fixture.componentInstance;
    c.current = 'sms';
    c.selected = 'push';
    c.save();
    expect(TestBed.inject(AuthService).stepUp).toHaveBeenCalled();
    expect(c.busy).toBeFalse();
  });
});
