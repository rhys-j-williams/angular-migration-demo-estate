import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let auth: { isAuthenticated: boolean; login: jasmine.Spy };
  const state = { url: '/accounts/acc-1' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    auth = { isAuthenticated: false, login: jasmine.createSpy('login') };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
    guard = TestBed.inject(AuthGuard);
  });

  it('lets an authenticated customer through', () => {
    auth.isAuthenticated = true;
    expect(guard.canActivate(route, state)).toBeTrue();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('starts the Keystone code flow with the attempted URL when there is no session', () => {
    expect(guard.canActivate(route, state)).toBeFalse();
    expect(auth.login).toHaveBeenCalledWith('/accounts/acc-1');
  });

  it('applies the same rule to child routes', () => {
    expect(guard.canActivateChild(route, state)).toBeFalse();
    expect(auth.login).toHaveBeenCalledTimes(1);
  });
});
