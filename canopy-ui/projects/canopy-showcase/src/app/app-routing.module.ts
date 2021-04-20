import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { TokensPageComponent } from './pages/foundations/tokens-page.component';
import { ThemesPageComponent } from './pages/foundations/themes-page.component';
import { IconsPageComponent } from './pages/foundations/icons-page.component';
import { COMPONENT_PAGES } from './pages/components/component-pages';

const routes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'foundations/tokens', component: TokensPageComponent },
  { path: 'foundations/themes', component: ThemesPageComponent },
  { path: 'foundations/icons', component: IconsPageComponent },
  ...COMPONENT_PAGES.map(p => ({ path: `components/${p.slug}`, component: p.component })),
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
