import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subscription, fromEvent, merge, timer } from 'rxjs';
import { map, switchMap, takeWhile, throttleTime } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../config/config.service';
import { SplunkLoggerService } from '../telemetry/splunk-logger.service';

export type IdleState = 'active' | 'warning' | 'expired' | 'stopped';

export interface IdleSnapshot {
  state: IdleState;
  /** Seconds until logout while in the warning state; null otherwise. */
  secondsRemaining: number | null;
}

/**
 * Session idle timeout. Policy from Information Security Standard ISS-14 section 6.3: warn the
 * customer after eight minutes without activity, end the session at ten. Both numbers come from
 * runtime config (session.idleWarningSeconds / idleLogoutSeconds) so UAT can run short timers.
 *
 * Built from RxJS rather than ng-idle (MOL-1362, October 2021): ng-idle's interrupt sources kept
 * the session alive on a background tab because it counted the periodic balance refresh as
 * activity, and customers came back to a still-open session after lunch. The
 * rule now is simple. Activity is a real DOM event from the customer (pointer, key, touch, scroll,
 * visibility change to visible); nothing the application does by itself counts.
 *
 * Timeline per activity event:
 *   t=0            activity, timers reset, state active
 *   t=warnAfter    state warning, countdown starts (the dialog in AppComponent subscribes)
 *   t=logoutAfter  state expired, AuthService.logout('idle')
 *
 * `extend()` is what the "I'm still here" button calls; any activity does the same thing. Timers run
 * outside the Angular zone (a change detection pass every second for ten minutes is exactly what
 * we do not want) and re-enter it only to emit state.
 */
@Injectable({ providedIn: 'root' })
export class IdleTimeoutService implements OnDestroy {
  private static readonly ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel', 'pointermove'];

  private readonly state$ = new BehaviorSubject<IdleSnapshot>({ state: 'stopped', secondsRemaining: null });
  private readonly activity$ = new BehaviorSubject<number>(Date.now());
  private subscription: Subscription | null = null;
  private activitySubscription: Subscription | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly logger: SplunkLoggerService,
    private readonly zone: NgZone,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  get snapshot$(): Observable<IdleSnapshot> {
    return this.state$.asObservable();
  }

  get state(): IdleState {
    return this.state$.getValue().state;
  }

  /** Called by session effects when the customer is authenticated. Idempotent. */
  start(): void {
    if (this.subscription) {
      return;
    }
    const { idleWarningSeconds, idleLogoutSeconds } = this.config.value.session;

    this.zone.runOutsideAngular(() => {
      this.activitySubscription = merge(
        ...IdleTimeoutService.ACTIVITY_EVENTS.map(name => fromEvent(this.document, name, { passive: true })),
        fromEvent(this.document, 'visibilitychange').pipe(
          switchMap(() => (this.document.visibilityState === 'visible' ? [null] : EMPTY))
        )
      )
        .pipe(throttleTime(1000))
        .subscribe(() => this.activity$.next(Date.now()));

      this.subscription = this.activity$
        .pipe(
          switchMap(() =>
            timer(0, 1000).pipe(
              map(tick => this.toSnapshot(tick, idleWarningSeconds, idleLogoutSeconds)),
              takeWhile(snap => snap.state !== 'expired', true)
            )
          )
        )
        .subscribe(snap => this.publish(snap));
    });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.activitySubscription?.unsubscribe();
    this.subscription = null;
    this.activitySubscription = null;
    this.state$.next({ state: 'stopped', secondsRemaining: null });
  }

  /** "I'm still here". Also refreshes the access token if it is close to expiry. */
  extend(): void {
    this.activity$.next(Date.now());
    void this.auth.refresh();
    this.logger.info('session.idle.extended');
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private toSnapshot(elapsedSeconds: number, warnAfter: number, logoutAfter: number): IdleSnapshot {
    if (elapsedSeconds >= logoutAfter) {
      return { state: 'expired', secondsRemaining: 0 };
    }
    if (elapsedSeconds >= warnAfter) {
      return { state: 'warning', secondsRemaining: logoutAfter - elapsedSeconds };
    }
    return { state: 'active', secondsRemaining: null };
  }

  private publish(snap: IdleSnapshot): void {
    const previous = this.state$.getValue();
    if (previous.state === snap.state && previous.secondsRemaining === snap.secondsRemaining) {
      return;
    }
    this.zone.run(() => {
      this.state$.next(snap);
      if (snap.state === 'warning' && previous.state !== 'warning') {
        this.logger.info('session.idle.warning');
      }
      if (snap.state === 'expired') {
        this.logger.info('session.idle.expired');
        this.stop();
        this.auth.logout('idle');
      }
    });
  }
}
