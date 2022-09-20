import { Component, NgZone } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LanternModule } from './lantern.module';
import { LanternService } from './lantern.service';
import { maskPath } from './lantern-router.service';
import { LanternVendorApi, LanternWindow } from './lantern.vendor';

@Component({ template: '' })
class BlankComponent {}

describe('maskPath', () => {
  it('drops query string and fragment and masks id-looking segments', () => {
    expect(maskPath('/accounts/ACC-000123/transactions?page=2#top')).toBe('/accounts/:id/transactions');
    expect(maskPath('/customers/CUS-100003')).toBe('/customers/:id');
    expect(maskPath('/cards/4000123412341234')).toBe('/cards/:id');
    expect(maskPath('/transfers/new')).toBe('/transfers/new');
    expect(maskPath('')).toBe('/');
  });
});

describe('LanternRouterTracker', () => {
  const win = window as LanternWindow;
  let vendor: jasmine.SpyObj<LanternVendorApi>;
  let router: Router;

  beforeEach(() => {
    vendor = jasmine.createSpyObj<LanternVendorApi>('Lantern', ['load', 'track', 'page', 'identify']);
    win.Lantern = vendor;
    TestBed.configureTestingModule({
      declarations: [BlankComponent],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'accounts', component: BlankComponent },
          { path: 'accounts/:accountId', component: BlankComponent, data: { lanternPage: 'account-detail' } },
          { path: '', component: BlankComponent }
        ]),
        LanternModule.forRoot({ writeKey: 'wk_test', appName: 'spec' })
      ]
    });
    router = TestBed.inject(Router);
    TestBed.inject(LanternService);
  });

  afterEach(() => {
    delete win.Lantern;
  });

  it('fires a page event on NavigationEnd with masked path and referrer', fakeAsync(() => {
    const zone = TestBed.inject(NgZone);
    zone.run(() => router.navigateByUrl('/accounts'));
    tick();
    zone.run(() => router.navigateByUrl('/accounts/ACC-000123?tab=pending'));
    tick();

    expect(vendor.page).toHaveBeenCalledTimes(2);
    expect(vendor.page.calls.argsFor(0)[0]).toBe('/accounts');
    expect(vendor.page.calls.argsFor(0)[1])
      .toEqual(jasmine.objectContaining({ path: '/accounts', referrerPath: null }));
    // route data name wins over the masked url, and the url is still masked in properties
    expect(vendor.page.calls.argsFor(1)[0]).toBe('account-detail');
    expect(vendor.page.calls.argsFor(1)[1]).toEqual(jasmine.objectContaining({
      path: '/accounts/:id', referrerPath: '/accounts', routeName: 'account-detail'
    }));
  }));

  it('does not fire twice for the same url', fakeAsync(() => {
    const zone = TestBed.inject(NgZone);
    zone.run(() => router.navigateByUrl('/accounts'));
    tick();
    zone.run(() => router.navigateByUrl('/accounts'));
    tick();
    expect(vendor.page).toHaveBeenCalledTimes(1);
  }));
});
