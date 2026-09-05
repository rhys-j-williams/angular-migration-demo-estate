import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HomePageComponent } from './home/home-page.component';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { TokensPageComponent } from './foundations/tokens-page.component';
import { ThemesPageComponent } from './foundations/themes-page.component';
import { IconsPageComponent } from './foundations/icons-page.component';
import { COMPONENT_PAGE_COMPONENTS } from './components/component-pages';

const PAGES = [HomePageComponent, DashboardPageComponent, TokensPageComponent, ThemesPageComponent, IconsPageComponent];

@NgModule({
  imports: [SharedModule],
  declarations: [...PAGES, ...COMPONENT_PAGE_COMPONENTS],
  exports: PAGES
})
export class PagesModule {}
