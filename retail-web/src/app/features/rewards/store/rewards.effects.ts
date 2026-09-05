import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { RewardsApiService } from '../../../core/api/rewards-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { rewardsActions } from './rewards.actions';
import { rewardsSelectors } from './rewards.selectors';

/** Anything loaded in the last 300s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 300000;

@Injectable()
export class RewardsEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rewardsActions.load),
      concatLatestFrom(() => this.store.select(rewardsSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.activity().pipe(
          map(items => rewardsActions.loaded({ items })),
          catchError((error: AppError) => of(rewardsActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: RewardsApiService) {}
}
