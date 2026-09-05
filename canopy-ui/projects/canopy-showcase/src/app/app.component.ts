import { Component } from '@angular/core';
import { CnNavItem } from '@meridian/canopy-ui/layout';
import { ShowcaseFixturesService } from './shared/fixtures.service';
import { COMPONENT_PAGES } from './pages/components/component-pages';

@Component({
  selector: 'cs-root',
  template: `
    <cn-page-shell appName="Canopy" environmentLabel="showcase 3.7.2" [nav]="nav" [userName]="userName" [showThemeToggle]="true"
                   (signOut)="signedOut = true">
      <cn-a11y-announcer></cn-a11y-announcer>
      <router-outlet></router-outlet>
    </cn-page-shell>
  `
})
export class AppComponent {
  signedOut = false;
  readonly userName: string;

  readonly nav: CnNavItem[] = [
    { id: 'home', label: 'Overview', icon: 'cn:home', link: '/' },
    { id: 'dashboard', label: 'Banking demo', icon: 'cn:account', link: '/dashboard', badge: 'live' },
    {
      id: 'foundations',
      label: 'Foundations',
      icon: 'cn:settings',
      link: '/foundations/tokens',
      children: [
        { id: 'tokens', label: 'Tokens', link: '/foundations/tokens' },
        { id: 'themes', label: 'Themes', link: '/foundations/themes' },
        { id: 'icons', label: 'Icons', link: '/foundations/icons' }
      ]
    },
    {
      id: 'components',
      label: 'Components',
      icon: 'cn:menu',
      link: '/components/button',
      children: COMPONENT_PAGES.map(p => ({ id: p.slug, label: p.selector, link: `/components/${p.slug}` }))
    }
  ];

  constructor(fixtures: ShowcaseFixturesService) {
    this.userName = fixtures.customer.displayName;
  }
}
