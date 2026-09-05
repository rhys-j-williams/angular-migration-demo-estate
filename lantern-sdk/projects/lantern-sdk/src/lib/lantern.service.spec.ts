import { TestBed } from '@angular/core/testing';
import { LANTERN_CONFIG } from './lantern.config';
import { LanternService } from './lantern.service';
import { LanternVendorApi, LanternWindow } from './lantern.vendor';

describe('LanternService', () => {
  const win = window as LanternWindow;
  let vendor: jasmine.SpyObj<LanternVendorApi>;

  beforeEach(() => {
    vendor = jasmine.createSpyObj<LanternVendorApi>('Lantern', ['load', 'track', 'page', 'identify', 'reset']);
    win.Lantern = vendor;
    sessionStorage.clear();
    document.querySelectorAll('script[data-lantern-sdk]').forEach((s) => s.remove());
  });

  afterEach(() => {
    delete win.Lantern;
  });

  function setup(config: object = { writeKey: 'wk_test', appName: 'spec' }): LanternService {
    TestBed.configureTestingModule({ providers: [{ provide: LANTERN_CONFIG, useValue: config }] });
    return TestBed.inject(LanternService);
  }

  it('forwards track/page/identify to window.Lantern with app context', () => {
    const svc = setup({ writeKey: 'wk_test', appName: 'retail-web', appVersion: '3.1.0' });
    svc.track('transfer.submit', { amountBand: 'lt-500' });
    svc.page('/accounts');
    svc.identify('CUS-100003', { segment: 'retail' });

    expect(vendor.track).toHaveBeenCalledWith('transfer.submit', jasmine.objectContaining({
      amountBand: 'lt-500', app: 'retail-web', appVersion: '3.1.0', sdk: '@meridian/lantern-sdk@2.4.1'
    }));
    expect(vendor.page).toHaveBeenCalledWith('/accounts', jasmine.objectContaining({ app: 'retail-web' }));
    expect(vendor.identify).toHaveBeenCalledWith('CUS-100003', { segment: 'retail' });
    expect(svc.userId).toBe('CUS-100003');
  });

  it('is a no-op when disabled or when no config was provided', () => {
    const svc = setup({ writeKey: 'wk_test', disabled: true });
    svc.track('x');
    svc.init();
    expect(vendor.track).not.toHaveBeenCalled();
    expect(vendor.load).not.toHaveBeenCalled();
    expect(svc.enabled).toBeFalse();
  });

  it('init() loads the vendor script once, from the configured url', () => {
    const svc = setup({ writeKey: 'wk_test', scriptUrl: 'http://localhost:4607/lantern.min.js' });
    svc.init();
    svc.init();
    const tags = document.querySelectorAll('script[data-lantern-sdk]');
    expect(tags.length).toBe(1);
    expect((tags[0] as HTMLScriptElement).src).toBe('http://localhost:4607/lantern.min.js');
    expect(vendor.load).toHaveBeenCalledTimes(1);
    expect(vendor.load).toHaveBeenCalledWith('wk_test', jasmine.objectContaining({ debug: false }));
  });

  it('queues calls in the snippet stub when the vendor script is not there yet', () => {
    delete win.Lantern;
    const svc = setup();
    svc.track('early.event');
    const stub = (window as LanternWindow).Lantern as LanternVendorApi;
    expect(stub).toBeDefined();
    const queued = (stub.q || []) as unknown[][];
    expect(queued.length).toBe(1);
    expect(queued[0][0]).toBe('track');
    expect(queued[0][1]).toBe('early.event');
    expect(queued[0][2]).toEqual(jasmine.objectContaining({ app: 'spec' }));
  });

  it('generates a stable local session id and persists it in sessionStorage', () => {
    const svc = setup();
    const first = svc.sessionId();
    expect(first).toMatch(/^las_[0-9a-f]{32}$/);
    expect(svc.sessionId()).toBe(first);
    expect(sessionStorage.getItem('mtb.lantern.session')).toContain(first);
    svc.reset();
    expect(svc.sessionId()).not.toBe(first);
    expect(vendor.reset).toHaveBeenCalled();
  });

  it('prefers the vendor session id once the script exposes one', () => {
    (vendor as LanternVendorApi).sessionId = () => 'vendor-session-1';
    const svc = setup();
    expect(svc.sessionId()).toBe('vendor-session-1');
  });
});
