import { HttpClient } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';

import { CnCoreModule } from '@meridian/canopy-ui/core';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { translateLoaderFactory } from './core/i18n/translate-loader';
import { AuthCallbackComponent } from './shell/auth-callback/auth-callback.component';
import { IdleWarningDialogComponent } from './shell/idle-warning-dialog/idle-warning-dialog.component';
import { LoggedOutComponent } from './shell/logged-out/logged-out.component';
import { ShellComponent } from './shell/shell/shell.component';
import { SwUpdateBannerComponent } from './shell/sw-update-banner/sw-update-banner.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, ShellComponent, AuthCallbackComponent, LoggedOutComponent, IdleWarningDialogComponent, SwUpdateBannerComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    CnCoreModule.forRoot({ currency: 'USD', density: 'default', defaultTheme: 'light', themeStorageKey: 'mol.theme' }),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: { provide: TranslateLoader, useFactory: translateLoaderFactory, deps: [HttpClient] }
    }),
    NgxMaskModule.forRoot({ validation: false }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Wait for the app to settle before registering so the SW does not compete with the first
      // BFF calls for bandwidth. 'registerWhenStable:30000' is the CLI default; we keep it explicit.
      registrationStrategy: 'registerWhenStable:30000'
    }),
    AppRoutingModule
  ],
  providers: [
    // LOCALE_ID is set per bundle by the CLI's localize step; this default is what `ng serve` uses.
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
