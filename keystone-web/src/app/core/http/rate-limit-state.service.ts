import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

export interface RateLimitState {
  limited: boolean;
  /** Epoch ms when the IdP said we may try again. */
  retryAt: number | null;
  /** Which action was limited; drives the banner copy. */
  scope: 'login' | 'otp' | 'recovery' | null;
}

const IDLE: RateLimitState = { limited: false, retryAt: null, scope: null };

/**
 * Tracks 429s from the IdP so the banner can count down. The IdP limits per username and per
 * source IP (see KEY-1088 for the numbers); we only ever see the effect.
 */
@Injectable({ providedIn: 'root' })
export class RateLimitStateService {
  private readonly state$ = new BehaviorSubject<RateLimitState>(IDLE);

  get state(): Observable<RateLimitState> {
    return this.state$.asObservable();
  }

  /** Seconds until retry, ticking once a second; 0 once clear. */
  get secondsRemaining(): Observable<number> {
    return this.state$.pipe(
      switchMap((s) => {
        if (!s.limited || s.retryAt === null) {
          return timer(0).pipe(map(() => 0));
        }
        return timer(0, 1000).pipe(
          map(() => Math.max(0, Math.ceil((s.retryAt! - Date.now()) / 1000))),
          startWith(Math.max(0, Math.ceil((s.retryAt - Date.now()) / 1000))),
        );
      }),
    );
  }

  limited(retryAfterSeconds: number, scope: RateLimitState['scope']): void {
    const seconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds : 60;
    this.state$.next({ limited: true, retryAt: Date.now() + seconds * 1000, scope });
  }

  clear(): void {
    if (this.state$.value.limited) {
      this.state$.next(IDLE);
    }
  }

  get isLimited(): boolean {
    const s = this.state$.value;
    if (!s.limited) {
      return false;
    }
    if (s.retryAt !== null && s.retryAt <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }
}
