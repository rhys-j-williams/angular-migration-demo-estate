import { TestBed } from '@angular/core/testing';

import { AuthTelemetryService } from './auth-telemetry.service';

// environment.ts has telemetryEnabled=false, so locally the service is a buffer and nothing more.
// The beacon path is covered by the UAT smoke job, not here.
describe('AuthTelemetryService (telemetry disabled)', () => {
  let svc: AuthTelemetryService;

  beforeEach(() => {
    svc = TestBed.inject(AuthTelemetryService);
  });

  it('buffers events without sending', () => {
    const beacon = spyOn(navigator, 'sendBeacon');
    for (let i = 0; i < 12; i++) {
      svc.record('login.shown');
    }
    expect(svc.pending()).toBe(12);
    expect(beacon).not.toHaveBeenCalled();
  });

  it('flush drops the buffer rather than sending when disabled', () => {
    const beacon = spyOn(navigator, 'sendBeacon');
    svc.record('mfa.otp.failed', 'invalid_code');
    svc.flush();
    expect(svc.pending()).toBe(0);
    expect(beacon).not.toHaveBeenCalled();
  });
});
