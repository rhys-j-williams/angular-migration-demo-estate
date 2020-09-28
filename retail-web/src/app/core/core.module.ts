import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { ErrorHandler, NgModule, Optional, SkipSelf } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { LanternModule } from '@meridian/lantern-sdk';

import { environment } from '../../environments/environment';
import { AUTH_INITIALIZER } from './auth/auth.initializer';
import { keystoneStorageFactory } from './auth/keystone-storage';
import { CONFIG_INITIALIZER } from './config/config.initializer';
import { GlobalErrorHandler } from './errors/global-error.handler';
import { FLAGS_INITIALIZER } from './flags/flags.initializer';
import { HTTP_INTERCEPTOR_PROVIDERS } from './interceptors';
import { rootMetaReducers, rootReducers } from './store/root-state';
import { SessionEffects } from './store/session/session.effects';

/**
 * Imported once by AppModule. Holds everything that has to exist exactly once: HTTP set-up, auth,
 * the root store, the error handler, the Lantern SDK.
 *
 * XSRF: bff-retail sets MERIDIAN-XSRF (double submit cookie) and expects it back in
 * X-MERIDIAN-XSRF on every mutating call. The names are bank wide (PLAT-233), the mobile SDK uses
 * the same ones. Angular only adds the header for relative URLs, which is fine because the BFF is
 * behind the same origin via nginx.
 *
 * Lantern: LanternModule.forRoot registers the router page tracker and the analytics session
 * header interceptor, which lands after ours in the chain. The write key is a runtime value, but
 * forRoot wants it at module compile time; the SDK reads the placeholder here and LanternService
 * re-points it from env.json in the APP_INITIALIZER (LNTN-503 explains why the SDK cannot take a
 * factory).
 */
@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'MERIDIAN-XSRF',
      headerName: 'X-MERIDIAN-XSRF'
    }),
    OAuthModule.forRoot({
      resourceServer: {
        // Empty on purpose: BearerTokenInterceptor does the allow-listing from runtime config;
        // the library's own interceptor would need the URLs at compile time.
        allowedUrls: [],
        sendAccessToken: false
      }
    }),
    StoreModule.forRoot(rootReducers, {
      metaReducers: rootMetaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictActionWithinNgZone: true,
        strictActionTypeUniqueness: true
      }
    }),
    EffectsModule.forRoot([SessionEffects]),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    StoreDevtoolsModule.instrument({
      name: 'Meridian Online',
      maxAge: 50,
      logOnly: environment.production,
      actionsBlocklist: ['@ngrx/router-store/*']
    }),
    LanternModule.forRoot({
      writeKey: environment.lantern.writeKey,
      scriptUrl: environment.lantern.scriptUrl,
      trackRouterEvents: true,
      attachSessionHeader: true,
      sessionHeaderUrlPrefixes: ['/api/'],
      debug: environment.lantern.debug,
      disabled: environment.lantern.disabled
    })
  ],
  providers: [
    CONFIG_INITIALIZER,
    AUTH_INITIALIZER,
    FLAGS_INITIALIZER,
    { provide: OAuthStorage, useFactory: keystoneStorageFactory },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ...HTTP_INTERCEPTOR_PROVIDERS
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
