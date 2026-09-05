import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { FeatureFlagService } from '../flags/feature-flag.service';
import { FeatureFlagGuard } from './feature-flag.guard';

describe('FeatureFlagGuard', () => {
  let guard: FeatureFlagGuard;
  let flags: jasmine.SpyObj<FeatureFlagService>;
  let router: Router;
  const state = { url: '/rewards' } as RouterStateSnapshot;

  function routeWith(data: Record<string, unknown>): ActivatedRouteSnapshot {
    return { data, routeConfig: { path: 'rewards' } } as unknown as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    flags = jasmine.createSpyObj<FeatureFlagService>('FeatureFlagService', ['isEnabled$']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: FeatureFlagService, useValue: flags }]
    });
    guard = TestBed.inject(FeatureFlagGuard);
    router = TestBed.inject(Router);
  });

  it('allows when the flag is on', done => {
    flags.isEnabled$.and.returnValue(of(true));
    guard.canActivate(routeWith({ flag: 'mol.rewards.enabled' }), state).subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('sends the customer to /not-found (not /forbidden) when the flag is off', done => {
    flags.isEnabled$.and.returnValue(of(false));
    guard.canActivate(routeWith({ flag: 'mol.rewards.enabled' }), state).subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/not-found');
      done();
    });
  });

  it('fails closed when Semaphore errors', done => {
    flags.isEnabled$.and.returnValue(throwError(() => new Error('semaphore down')));
    guard.canActivate(routeWith({ flag: 'mol.rewards.enabled' }), state).subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/not-found');
      done();
    });
  });

  it('warns and allows when a route forgets data.flag', done => {
    spyOn(console, 'warn');
    guard.canActivate(routeWith({}), state).subscribe(result => {
      expect(result).toBeTrue();
      expect(console.warn).toHaveBeenCalled();
      expect(flags.isEnabled$).not.toHaveBeenCalled();
      done();
    });
  });
});
