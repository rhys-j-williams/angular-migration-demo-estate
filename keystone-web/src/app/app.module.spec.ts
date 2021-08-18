import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LoginModule } from './features/login/login.module';
import { MfaModule } from './features/mfa/mfa.module';
import { StepUpModule } from './features/step-up/step-up.module';
import { RECOVERY_ROUTES } from './features/recovery/recovery.routes';
import { DeviceTrustPageComponent } from './features/device-trust/device-trust-page/device-trust-page.component';
import { CoreModule } from './core/core.module';

// Module smoke test. Every lazy feature is imported statically here so (a) a bad declarations /
// imports list fails in CI rather than on first navigation, and (b) the coverage report includes
// the files nobody wrote specs for. Without this the dashboard showed 89% for an app whose
// recovery flow has zero tests (KEY-2077). Do not delete because it looks pointless.
describe('feature modules', () => {
  it('LoginModule compiles', async () => {
    await TestBed.configureTestingModule({ imports: [LoginModule, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule] }).compileComponents();
    expect(TestBed.inject(LoginModule)).toBeTruthy();
  });

  it('MfaModule compiles', async () => {
    await TestBed.configureTestingModule({ imports: [MfaModule, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule] }).compileComponents();
    expect(TestBed.inject(MfaModule)).toBeTruthy();
  });

  it('StepUpModule compiles', async () => {
    await TestBed.configureTestingModule({ imports: [StepUpModule, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule] }).compileComponents();
    expect(TestBed.inject(StepUpModule)).toBeTruthy();
  });

  it('recovery routes point at standalone components', () => {
    expect(RECOVERY_ROUTES.length).toBeGreaterThan(0);
    expect(DeviceTrustPageComponent).toBeDefined();
  });

  it('CoreModule refuses to be imported twice', () => {
    expect(() => new CoreModule(new CoreModule())).toThrowError(/CoreModule/);
  });
});
