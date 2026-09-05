import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { LazyModuleGuard } from './lazy-module.guard';

describe('LazyModuleGuard', () => {
  let guard: LazyModuleGuard;
  let auth: { isAuthenticated: boolean; login: jasmine.Spy };
  let entitlements: jasmine.SpyObj<EntitlementsService>;
  let router: Router;
  const segments = [new UrlSegment('transfers', {}), new UrlSegment('new', {})];
  const route: Route = { path: 'transfers', data: { entitlement: 'transfers' } };

  beforeEach(() => {
    auth = { isAuthenticated: true, login: jasmine.createSpy('login') };
    entitlements = jasmine.createSpyObj<EntitlementsService>('EntitlementsService', ['has$']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: EntitlementsService, useValue: entitlements }
      ]
    });
    guard = TestBed.inject(LazyModuleGuard);
    router = TestBed.inject(Router);
  });

  it('does not download the chunk for an anonymous visitor', done => {
    auth.isAuthenticated = false;
    guard.canLoad(route, segments).subscribe(result => {
      expect(result).toBeFalse();
      expect(auth.login).toHaveBeenCalledWith('/transfers/new');
      done();
    });
  });

  it('loads when the customer holds the entitlement', done => {
    entitlements.has$.and.returnValue(of(true));
    guard.canLoad(route, segments).subscribe(result => {
      expect(result).toBeTrue();
      expect(entitlements.has$).toHaveBeenCalledWith('transfers');
      done();
    });
  });

  it('redirects to /forbidden without the entitlement', done => {
    entitlements.has$.and.returnValue(of(false));
    guard.canLoad(route, segments).subscribe(result => {
      expect(router.serializeUrl(result as UrlTree)).toBe('/forbidden');
      done();
    });
  });

  it('allows when entitlements are unavailable - bandwidth, not security', done => {
    entitlements.has$.and.returnValue(throwError(() => new Error('not loaded')));
    guard.canLoad(route, segments).subscribe(result => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('allows routes with no entitlement in data', done => {
    guard.canLoad({ path: 'help' }, [new UrlSegment('help', {})]).subscribe(result => {
      expect(result).toBeTrue();
      expect(entitlements.has$).not.toHaveBeenCalled();
      done();
    });
  });
});
