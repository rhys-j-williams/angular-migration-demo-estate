import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { BrandHeaderComponent } from './shared/components/brand-header/brand-header.component';
import { LegalFooterComponent } from './shared/components/legal-footer/legal-footer.component';
import { MaintenanceNoticeComponent } from './shared/components/maintenance-notice/maintenance-notice.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, CoreModule, AppRoutingModule, BrandHeaderComponent, LegalFooterComponent, MaintenanceNoticeComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
