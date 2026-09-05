import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { mfaCompletedGuard } from './core/auth/mfa-completed.guard';
import { CallbackComponent } from './features/session/callback/callback.component';
import { NotFoundComponent } from './features/session/not-found/not-found.component';
import { SessionExpiredComponent } from './features/session/session-expired/session-expired.component';
import { SignedInComponent } from './features/session/signed-in/signed-in.component';
import { SignedOutComponent } from './features/session/signed-out/signed-out.component';

/**
 * Route map. Lazy NgModules for the older areas, standalone `loadComponent` for the ones that were
 * migrated in KEY-2210 (device trust, recovery). The mix is not a design decision, it is a record
 * of how far we got.
 *
 * Paths are part of the IdP client registration (redirect_uri, post_logout_redirect_uri) and of
 * the calling apps' step-up links. Renaming one is a change request, not a refactor.
 */
const routes: Routes = [
  { path: '', loadChildren: () => import('./features/login/login.module').then((m) => m.LoginModule) },
  { path: 'mfa', loadChildren: () => import('./features/mfa/mfa.module').then((m) => m.MfaModule) },
  { path: 'step-up', loadChildren: () => import('./features/step-up/step-up.module').then((m) => m.StepUpModule) },
  {
    path: 'device-trust',
    canActivate: [mfaCompletedGuard],
    loadComponent: () => import('./features/device-trust/device-trust-page/device-trust-page.component').then((m) => m.DeviceTrustPageComponent),
  },
  { path: 'recovery', loadChildren: () => import('./features/recovery/recovery.routes').then((m) => m.RECOVERY_ROUTES) },
  { path: 'callback', component: CallbackComponent },
  { path: 'signed-in', component: SignedInComponent },
  { path: 'signed-out', component: SignedOutComponent },
  { path: 'expired', component: SessionExpiredComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', paramsInheritanceStrategy: 'always' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
