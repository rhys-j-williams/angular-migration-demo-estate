import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { provideTestConfig } from '../../../testing/test-config';
import { AuthService } from '../auth/auth.service';
import { LanternService } from '../telemetry/lantern.service';
import { MfaStepUpGuard, PENDING_AMOUNT_SOURCE_KEY } from './mfa-step-up.guard';

describe('MfaStepUpGuard', () => {
  let guard: MfaStepUpGuard;
  let router: Router;
  let auth: { isAuthenticated: boolean; hasRecentMfa: jasmine.Spy; mfaAgeSeconds: jasmine.Spy; stepUp: jasmine.Spy; login: jasmine.Spy };
  let lantern: jasmine.SpyObj<LanternService>;
  const state = { url: '/transfers/new/review' } as RouterStateSnapshot;

  function route(data: Record<string, unknown> = {}): ActivatedRouteSnapshot {
    return { data } as unknown as ActivatedRouteSnapshot;
  }

  function pending(amountMinor: number | null): void {
    if (amountMinor === null) sessionStorage.removeItem(PENDING_AMOUNT_SOURCE_KEY);
    else sessionStorage.setItem(PENDING_AMOUNT_SOURCE_KEY, String(amountMinor));
  }

  beforeEach(() => {
    auth = {
      isAuthenticated: true,
      hasRecentMfa: jasmine.createSpy('hasRecentMfa').and.returnValue(false),
      mfaAgeSeconds: jasmine.createSpy('mfaAgeSeconds').and.returnValue(1800),
      stepUp: jasmine.createSpy('stepUp'),
      login: jasmine.createSpy('login')
    };
    lantern = jasmine.createSpyObj<LanternService>('LanternService', ['track']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideTestConfig(),
        provideMockStore(),
        { provide: AuthService, useValue: auth },
        { provide: LanternService, useValue: lantern }
      ]
    });
    guard = TestBed.inject(MfaStepUpGuard);
    router = TestBed.inject(Router);
  });

  afterEach(() => sessionStorage.removeItem(PENDING_AMOUNT_SOURCE_KEY));

  it('passes a transfer under the threshold without touching MFA', done => {
    pending(249999);
    guard.canActivate(route(), state).subscribe(result => {
      expect(result).toBeTrue();
      expect(auth.hasRecentMfa).not.toHaveBeenCalled();
      done();
    });
  });

  it('passes a transfer at the threshold when the MFA claim is fresh', done => {
    pending(250000);
    auth.hasRecentMfa.and.returnValue(true);
    guard.canActivate(route(), state).subscribe(result => {
      expect(result).toBeTrue();
      expect(auth.hasRecentMfa).toHaveBeenCalledWith(600);
      expect(lantern.track).toHaveBeenCalledWith('transfer.stepup.satisfied', { amountBand: '2500-10000' });
      done();
    });
  });

  it('sends the customer to Keystone with a return URL when the claim is stale', done => {
    pending(1500000);
    guard.canActivate(route(), state).subscribe(result => {
      expect(result).toBeFalse();
      expect(auth.stepUp).toHaveBeenCalledWith('/transfers/new/review');
      expect(lantern.track).toHaveBeenCalledWith('transfer.stepup.required', { amountBand: 'gte10000', mfaAgeSeconds: 1800 });
      done();
    });
  });

  it('never puts the amount itself in telemetry', done => {
    pending(987654);
    auth.hasRecentMfa.and.returnValue(false);
    guard.canActivate(route(), state).subscribe(() => {
      const payload = JSON.stringify(lantern.track.calls.mostRecent().args[1]);
      expect(payload).not.toContain('987654');
      done();
    });
  });

  it('returns a deep link with no amount in flight to the start of the wizard', done => {
    pending(null);
    guard.canActivate(route(), state).subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/transfers/new');
      expect(auth.stepUp).not.toHaveBeenCalled();
      done();
    });
  });

  it('honours a per-route threshold override', done => {
    pending(100);
    guard.canActivate(route({ mfaThresholdMinor: 0 }), state).subscribe(result => {
      expect(result).toBeFalse();
      expect(auth.stepUp).toHaveBeenCalled();
      done();
    });
  });

  it('falls back to login when somehow reached unauthenticated', done => {
    auth.isAuthenticated = false;
    guard.canActivate(route(), state).subscribe(result => {
      expect(result).toBeFalse();
      expect(auth.login).toHaveBeenCalledWith('/transfers/new/review');
      done();
    });
  });
});
