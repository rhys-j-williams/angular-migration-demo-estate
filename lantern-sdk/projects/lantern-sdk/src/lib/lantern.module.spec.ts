import { Compiler, Injector, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LanternModule } from './lantern.module';
import { LanternService } from './lantern.service';
import { LanternVendorApi, LanternWindow } from './lantern.vendor';

describe('LanternModule', () => {
  const win = window as LanternWindow;
  let vendor: jasmine.SpyObj<LanternVendorApi>;

  beforeEach(() => {
    vendor = jasmine.createSpyObj<LanternVendorApi>('Lantern', ['load', 'track', 'page', 'identify']);
    win.Lantern = vendor;
    document.querySelectorAll('script[data-lantern-sdk]').forEach((s) => s.remove());
  });

  afterEach(() => {
    delete win.Lantern;
  });

  it('forRoot() initialises the service and loads the vendor script', () => {
    TestBed.configureTestingModule({
      imports: [LanternModule.forRoot({ writeKey: 'wk_test', scriptUrl: 'http://localhost:4607/lantern.min.js' })]
    });
    TestBed.inject(LanternModule);
    expect(vendor.load).toHaveBeenCalledWith('wk_test', jasmine.objectContaining({}));
    expect(document.querySelectorAll('script[data-lantern-sdk="2.4.1"]').length).toBe(1);
    expect(TestBed.inject(LanternService).enabled).toBeTrue();
  });

  it('refuses a second forRoot() in a lazy loaded module', () => {
    @NgModule({ imports: [LanternModule.forRoot({ writeKey: 'a' })] })
    class LazyFeatureModule {}

    TestBed.configureTestingModule({ imports: [LanternModule.forRoot({ writeKey: 'b' })] });
    TestBed.inject(LanternModule);
    const factory = TestBed.inject(Compiler).compileModuleSync(LazyFeatureModule);
    expect(() => factory.create(TestBed.inject(Injector))).toThrowError(/imported twice/);
  });

  it('plain LanternModule import (no forRoot) leaves the service disabled', () => {
    TestBed.configureTestingModule({ imports: [LanternModule] });
    TestBed.inject(LanternModule);
    expect(TestBed.inject(LanternService).enabled).toBeFalse();
    expect(vendor.load).not.toHaveBeenCalled();
  });
});
