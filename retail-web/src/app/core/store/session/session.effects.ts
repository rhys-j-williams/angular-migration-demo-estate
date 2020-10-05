import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';

import { MessagesApiService } from '../../api/messages-api.service';
import { ProfileApiService } from '../../api/profile-api.service';
import { AuthService } from '../../auth/auth.service';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { AppError } from '../../errors/app-error.model';
import { FeatureFlagService } from '../../flags/feature-flag.service';
import { IdleTimeoutService } from '../../session/idle-timeout.service';
import { LanternService } from '../../telemetry/lantern.service';
import { SplunkLoggerService } from '../../telemetry/splunk-logger.service';
import { sessionActions } from './session.actions';

@Injectable()
export class SessionEffects {
  /** AuthService.isAuthenticated$ -> store. The one place the OIDC world and the store meet. */
  readonly authState$ = createEffect(() =>
    this.auth.isAuthenticated$.pipe(
      map(ok =>
        ok
          ? sessionActions.authenticated({ customerId: this.auth.customerId ?? 'unknown', displayName: this.auth.claims?.given_name ?? null })
          : sessionActions.loggedOut()
      )
    )
  );

  readonly onAuthenticated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sessionActions.authenticated),
      tap(({ customerId }) => {
        this.idle.start();
        this.flags.startRefreshing();
        this.lantern.identifyCurrentCustomer();
        this.logger.customerRef = customerId;
        this.logger.sessionId = this.lantern.sessionId;
        this.logger.info('session.started', { mfa_age_seconds: this.auth.mfaAgeSeconds() ?? undefined });
      }),
      switchMap(() => [sessionActions.loadProfile()])
    )
  );

  readonly loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sessionActions.loadProfile),
      switchMap(() =>
        this.profileApi.me().pipe(
          map(profile => sessionActions.profileLoaded({ profile })),
          catchError((error: AppError) => of(sessionActions.profileFailed({ error })))
        )
      )
    )
  );

  readonly loadEntitlements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sessionActions.authenticated),
      switchMap(() => this.entitlements.load()),
      map(entitlements => sessionActions.entitlementsLoaded({ entitlements }))
    )
  );

  readonly unread$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sessionActions.profileLoaded),
      filter(() => this.flags.isEnabled('mol.secure-messages.enabled')),
      switchMap(() => this.messagesApi.unreadCount().pipe(catchError(() => EMPTY))),
      map(({ unread }) => sessionActions.unreadMessagesLoaded({ unread }))
    )
  );

  readonly idle$ = createEffect(() =>
    this.idle.snapshot$.pipe(
      map(snap =>
        snap.state === 'warning' && snap.secondsRemaining !== null
          ? sessionActions.idleWarning({ secondsRemaining: snap.secondsRemaining })
          : sessionActions.idleExtended()
      )
    )
  );

  readonly logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(sessionActions.logout),
        tap(({ reason }) => {
          this.logger.info('session.ended', { reason });
          this.idle.stop();
          this.flags.stopRefreshing();
          this.entitlements.reset();
          this.lantern.reset();
          this.logger.customerRef = null;
          this.auth.logout(reason);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly auth: AuthService,
    private readonly profileApi: ProfileApiService,
    private readonly messagesApi: MessagesApiService,
    private readonly entitlements: EntitlementsService,
    private readonly idle: IdleTimeoutService,
    private readonly flags: FeatureFlagService,
    private readonly lantern: LanternService,
    private readonly logger: SplunkLoggerService
  ) {}
}
