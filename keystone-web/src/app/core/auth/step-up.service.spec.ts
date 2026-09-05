import { StepUpService } from './step-up.service';

describe('StepUpService', () => {
  const svc = new StepUpService();

  it('allows the known first party origins only', () => {
    expect(svc.isAllowedReturn('https://online.meridiantrust.example/payments/new')).toBeTrue();
    expect(svc.isAllowedReturn('http://localhost:4200/help')).toBeTrue();
    expect(svc.isAllowedReturn('https://online.meridiantrust.example.evil.example/')).toBeFalse();
    expect(svc.isAllowedReturn('http://online.meridiantrust.example/')).toBeFalse();
    expect(svc.isAllowedReturn('javascript:alert(1)')).toBeFalse();
    expect(svc.isAllowedReturn(null)).toBeFalse();
  });

  it('round trips state and drops a tampered return url', () => {
    const state = svc.encodeState('http://localhost:4200/payments', 'payment.external');
    expect(svc.decodeState(state)).toEqual({ returnTo: 'http://localhost:4200/payments', reason: 'payment.external' });
    const bad = btoa(JSON.stringify({ r: 'https://phish.example/', why: 'x' }));
    expect(svc.decodeState(bad).returnTo).toBeNull();
    expect(svc.decodeState('not-base64').returnTo).toBeNull();
  });

  it('has a fallback description', () => {
    expect(svc.describe('wire.domestic')).toBe('Sending a wire');
    expect(svc.describe('nope')).toBe('Confirming it is you');
  });
});
