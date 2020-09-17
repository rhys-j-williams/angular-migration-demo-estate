import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { FeatureFlagGuard } from './core/guards/feature-flag.guard';
import { LazyModuleGuard } from './core/guards/lazy-module.guard';
import { SelectivePreloadingStrategy } from './core/routing/selective-preloading.strategy';
import { AuthCallbackComponent } from './shell/auth-callback/auth-callback.component';
import { LoggedOutComponent } from './shell/logged-out/logged-out.component';
import { ShellComponent } from './shell/shell/shell.component';

/**
 * Two trees: the authenticated shell (nav, idle timer, everything customer facing) and a handful of
 * public routes (auth callback, logged out, onboarding, disclosures, help, error pages).
 *
 * LazyModuleGuard only on the three big entitlement-gated chunks; see the guard for why.
 * Preloading: dashboard is eager, accounts and transfers preload shortly after (data.preload).
 */
const routes: Routes = [
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'logged-out', component: LoggedOutComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
        data: { preload: true, preloadDelayMs: 0, title: 'Dashboard' }
      },
      {
        path: 'accounts',
        loadChildren: () => import('./features/accounts/accounts.module').then(m => m.AccountsModule),
        data: { preload: true, preloadDelayMs: 2000, title: 'Accounts' }
      },
      {
        path: 'transfers',
        canLoad: [LazyModuleGuard],
        loadChildren: () => import('./features/transfers/transfers.module').then(m => m.TransfersModule),
        data: { entitlement: 'transfers', preload: true, preloadDelayMs: 4000, title: 'Transfers' }
      },
      {
        path: 'bill-pay',
        canLoad: [LazyModuleGuard],
        loadChildren: () => import('./features/bill-pay/bill-pay.module').then(m => m.BillPayModule),
        data: { entitlement: 'bill-pay', title: 'Bill pay' }
      },
      {
        path: 'cards',
        canLoad: [LazyModuleGuard],
        loadChildren: () => import('./features/cards/cards.module').then(m => m.CardsModule),
        data: { entitlement: 'cards', title: 'Cards' }
      },
      {
        path: 'statements',
        loadChildren: () => import('./features/statements/statements.module').then(m => m.StatementsModule),
        data: { title: 'Statements and documents' }
      },
      {
        path: 'alerts',
        loadChildren: () => import('./features/alerts/alerts.module').then(m => m.AlertsModule),
        data: { title: 'Alerts' }
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
        data: { title: 'Profile and security' }
      },
      {
        path: 'messages',
        canActivate: [FeatureFlagGuard],
        loadChildren: () => import('./features/messages/messages.module').then(m => m.MessagesModule),
        data: { flag: 'mol.secure-messages.enabled', title: 'Secure messages' }
      },
      {
        path: 'rewards',
        canActivate: [FeatureFlagGuard],
        loadChildren: () => import('./features/rewards/rewards.module').then(m => m.RewardsModule),
        data: { flag: 'mol.rewards.enabled', title: 'Rewards' }
      }
    ]
  },
  {
    path: 'open-account',
    loadChildren: () => import('./features/onboarding/onboarding.module').then(m => m.OnboardingModule),
    data: { title: 'Open an account' }
  },
  {
    path: 'help',
    loadChildren: () => import('./features/help/help.module').then(m => m.HelpModule),
    data: { title: 'Help' }
  },
  {
    path: 'disclosures',
    loadChildren: () => import('./features/disclosures/disclosures.module').then(m => m.DisclosuresModule),
    data: { title: 'Disclosures' }
  },
  {
    path: '',
    loadChildren: () => import('./features/errors/errors.module').then(m => m.ErrorsModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Block bootstrap until the first navigation resolves: avoids the dashboard flashing before
      // AuthGuard has had its say, and is required for the SSR experiment (MOL-3610, shelved).
      initialNavigation: 'enabledBlocking',
      preloadingStrategy: SelectivePreloadingStrategy,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      paramsInheritanceStrategy: 'always',
      // Kept on legacy since the Angular 11 upgrade. The transfer wizard's relative links
      // (`../review`) resolve differently under 'corrected' and MOL-2288 never got finished.
      relativeLinkResolution: 'legacy',
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
