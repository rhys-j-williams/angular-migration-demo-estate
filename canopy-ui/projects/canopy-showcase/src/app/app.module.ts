import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CnA11yModule } from '@meridian/canopy-ui/a11y';
import { CnCoreModule } from '@meridian/canopy-ui/core';
import { CnIconModule } from '@meridian/canopy-ui/icons';
import { CnPageShellModule } from '@meridian/canopy-ui/layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CnCoreModule.forRoot({ locale: 'en-US', currency: 'USD', themeStorageKey: 'canopy-showcase.theme' }),
    CnIconModule,
    CnA11yModule,
    CnPageShellModule,
    PagesModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
