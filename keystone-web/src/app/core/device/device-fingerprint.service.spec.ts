import { DeviceFingerprintService, FINGERPRINT_VERSION, FingerprintInputs } from './device-fingerprint.service';

describe('DeviceFingerprintService', () => {
  const svc = new DeviceFingerprintService();
  const inputs: FingerprintInputs = {
    userAgent: 'TestBrowser/1.0',
    language: 'en-US',
    languages: 'en-US,en',
    platform: 'Linux x86_64',
    hardwareConcurrency: 8,
    timezone: 'America/New_York',
    screen: '1280x900',
    colorDepth: 24,
    touchPoints: 0,
  };

  it('serialises with the version first so Fraud can re-baseline', () => {
    expect(svc.canonical(inputs).startsWith(`v${FINGERPRINT_VERSION}|`)).toBeTrue();
  });

  it('is deterministic', async () => {
    const a = await svc.hash(svc.canonical(inputs));
    const b = await svc.hash(svc.canonical({ ...inputs }));
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when any approved input changes', async () => {
    const base = await svc.hash(svc.canonical(inputs));
    const moved = await svc.hash(svc.canonical({ ...inputs, timezone: 'Europe/London' }));
    expect(moved).not.toBe(base);
  });

  it('only reads the fields agreed with Privacy', () => {
    const collected = svc.collect(
      { userAgent: 'ua', language: 'en', languages: ['en'], platform: 'p', hardwareConcurrency: 2, maxTouchPoints: 5 } as unknown as Navigator,
      { width: 1, height: 2, colorDepth: 30 } as unknown as Screen,
    );
    expect(Object.keys(collected).sort()).toEqual(
      ['colorDepth', 'hardwareConcurrency', 'language', 'languages', 'platform', 'screen', 'timezone', 'touchPoints', 'userAgent'],
    );
    expect(collected.screen).toBe('1x2');
    expect(collected.touchPoints).toBe(5);
  });

  it('never writes to storage', async () => {
    const before = localStorage.length + sessionStorage.length;
    await svc.compute().toPromise();
    expect(localStorage.length + sessionStorage.length).toBe(before);
  });
});
