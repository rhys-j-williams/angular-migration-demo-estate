import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LANTERN_CONFIG, LanternConfig } from './lantern.config';
import { LanternService } from './lantern.service';
import { LanternRouterTracker } from './lantern-router.service';
import { LanternSessionInterceptor } from './lantern-session.interceptor';
import { LanternTrackDirective } from './lantern-track.directive';

/** Only provided by forRoot, so the module can tell a root import from a feature module import. */
export class LanternRootMarker {}

/**
 * Import LanternModule.forRoot(environment.lantern) once, in AppModule. Feature modules that use
 * the lanternTrack directive import plain LanternModule.
 *
 * forRoot registers the router tracker and the session interceptor. Both read LANTERN_CONFIG, so
 * providing the token yourself instead of calling forRoot also works (keystone-web does this to
 * pull the write key from its runtime config endpoint).
 */
@NgModule({
  declarations: [LanternTrackDirective],
  exports: [LanternTrackDirective]
})
export class LanternModule {
  constructor(
    @Optional() lantern: LanternService | null,
    @Optional() @SkipSelf() parent: LanternRootMarker | null,
    @Optional() self: LanternRootMarker | null,
    // injected for the side effect: constructing it subscribes to router events
    @Optional() tracker: LanternRouterTracker | null
  ) {
    // tracker is injected only so forRoot() instantiates it eagerly; nothing to do with it here
    // tslint:disable-next-line:no-unused-expression
    void tracker;
    if (parent && self) {
      throw new Error('LanternModule.forRoot() imported twice. Import it in AppModule only.');
    }
    if (self && lantern) {
      lantern.init();
    }
  }

  static forRoot(config: LanternConfig): ModuleWithProviders<LanternModule> {
    return {
      ngModule: LanternModule,
      providers: [
        { provide: LANTERN_CONFIG, useValue: config },
        LanternRootMarker,
        LanternRouterTracker,
        { provide: HTTP_INTERCEPTORS, useClass: LanternSessionInterceptor, multi: true }
      ]
    };
  }
}
