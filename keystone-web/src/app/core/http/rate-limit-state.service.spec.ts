import { RateLimitStateService } from './rate-limit-state.service';

describe('RateLimitStateService', () => {
  let svc: RateLimitStateService;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2024-02-12T10:00:00Z'));
    svc = new RateLimitStateService();
  });

  afterEach(() => jasmine.clock().uninstall());

  it('is idle by default', () => {
    expect(svc.isLimited).toBeFalse();
  });

  it('becomes limited with a retry time', () => {
    svc.limited(30, 'login');
    expect(svc.isLimited).toBeTrue();
    jasmine.clock().mockDate(new Date('2024-02-12T10:00:31Z'));
    expect(svc.isLimited).toBeFalse();
  });

  it('defaults to sixty seconds for a missing Retry-After', () => {
    svc.limited(NaN, 'otp');
    jasmine.clock().mockDate(new Date('2024-02-12T10:00:59Z'));
    expect(svc.isLimited).toBeTrue();
    jasmine.clock().mockDate(new Date('2024-02-12T10:01:00Z'));
    expect(svc.isLimited).toBeFalse();
  });

  it('clears explicitly', () => {
    svc.limited(30, 'login');
    svc.clear();
    expect(svc.isLimited).toBeFalse();
  });
});
