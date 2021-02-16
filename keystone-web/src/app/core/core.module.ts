import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, Optional, SkipSelf } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { CnIconModule } from '@meridian/canopy-ui/icons';
import { CnToastModule } from '@meridian/canopy-ui/overlays';

import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth/auth-session.service';
import { CorrelationInterceptor } from './http/correlation.interceptor';
import { RateLimitInterceptor } from './http/rate-limit.interceptor';

/**
 * Singletons and the OAuth wiring. Imported once by AppModule; the guard in the constructor is
 * there because someone imported it from LoginModule in 2022 and we got two OAuthService
 * instances and a very confusing afternoon (KEY-1355).
 */
@NgModule({
  imports: [
    HttpClientModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [environment.bffBaseUrl],
        sendAccessToken: true,
      },
    }),
    CnIconModule,
    CnToastModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RateLimitInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthSessionService],
      useFactory: (session: AuthSessionService) => () =>
        session.configure().catch((err: unknown) => {
          // Discovery failing must not stop the shell rendering: the credential form still needs
          // to show the "we're having trouble" state rather than a white page (INC0141207).
          console.error('keystone: discovery document unavailable', err);
        }),
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent?: CoreModule) {
    if (parent) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
