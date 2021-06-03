import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, of, timer } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../config/config.service';
import { BearerTokenInterceptor } from '../interceptors/bearer-token.interceptor';
import { RetryBackoffInterceptor } from '../interceptors/retry-backoff.interceptor';

export type FlagValue = boolean | string | number;

interface SemaphoreEvaluation {
  environment: string;
  flags: Record<string, FlagValue>;
  evaluatedAt: string;
}

/**
 * Semaphore feature flags. One evaluate call at startup (anonymous, so the kill switches work
 * before login), another once we know the customer id (so percentage rollouts and segment rules
 * apply), then a refresh every `semaphore.refreshSeconds`.
 *
 * Fallback chain when Semaphore is unreachable: last good evaluation in this tab, then the
 * `features.*Enabled` toggles in env.json (mapped from `mol.<name>.enabled`), then false. This is
 * why the env.json toggles still exist; they are the floor, not the source of truth.
 *
 * Flag names follow `mol.<feature>.<thing>`; the list is in docs/feature-flags.md and Semaphore
 * itself is the record. Remove flags within two trains of 100% rollout (MOL-3140 clean-up rule).
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService implements OnDestroy {
  private readonly flags$ = new BehaviorSubject<Record<string, FlagValue>>({});
  private refresh: Subscription | null = null;
  private lastGood: Record<string, FlagValue> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfigService,
    private readonly auth: AuthService
  ) {}

  /** APP_INITIALIZER hook. Never rejects; a flag outage must not block boot. */
  bootstrap(): Promise<void> {
    return new Promise(resolve => {
      this.evaluate().subscribe({ next: () => resolve(), error: () => resolve() });
    });
  }

  /** Called from session effects after login so rules keyed on the customer apply. */
  startRefreshing(): void {
    if (this.refresh) {
      return;
    }
    const every = Math.max(30, this.config.value.semaphore.refreshSeconds) * 1000;
    this.refresh = timer(0, every).pipe(switchMap(() => this.evaluate())).subscribe();
  }

  stopRefreshing(): void {
    this.refresh?.unsubscribe();
    this.refresh = null;
  }

  isEnabled$(flag: string): Observable<boolean> {
    return this.flags$.pipe(
      map(flags => this.resolve(flags, flag)),
      distinctUntilChanged()
    );
  }

  isEnabled(flag: string): boolean {
    return this.resolve(this.flags$.getValue(), flag);
  }

  value<T extends FlagValue>(flag: string, fallback: T): T {
    const v = this.flags$.getValue()[flag];
    return (v === undefined ? fallback : v) as T;
  }

  ngOnDestroy(): void {
    this.stopRefreshing();
  }

  private evaluate(): Observable<Record<string, FlagValue>> {
    const { baseUrl, environment } = this.config.value.semaphore;
    const customer = this.auth.customerId;
    const params: Record<string, string> = { environment };
    if (customer) {
      params['userId'] = customer;
    }
    return this.http
      .get<SemaphoreEvaluation>(`${baseUrl}/evaluate`, {
        params,
        headers: {
          [BearerTokenInterceptor.ANONYMOUS_HEADER]: '1',
          [RetryBackoffInterceptor.NO_RETRY_HEADER]: '1'
        }
      })
      .pipe(
        map(res => res.flags ?? {}),
        tap(flags => {
          this.lastGood = flags;
          this.flags$.next(flags);
        }),
        catchError(() => {
          this.flags$.next(this.lastGood ?? {});
          return of(this.lastGood ?? {});
        })
      );
  }

  private resolve(flags: Record<string, FlagValue>, flag: string): boolean {
    const v = flags[flag];
    if (typeof v === 'boolean') {
      return v;
    }
    if (typeof v === 'string') {
      return v === 'on' || v === 'true';
    }
    return this.envFallback(flag);
  }

  /** mol.paylink.enabled -> features.paylinkEnabled */
  private envFallback(flag: string): boolean {
    if (!this.config.loaded) {
      return false;
    }
    const m = /^mol\.([a-z-]+)\.enabled$/.exec(flag);
    if (!m) {
      return false;
    }
    const key = m[1].replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) + 'Enabled';
    const features = this.config.value.features as unknown as Record<string, boolean | undefined>;
    return features[key] === true;
  }
}
