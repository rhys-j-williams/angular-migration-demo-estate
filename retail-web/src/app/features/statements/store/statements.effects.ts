import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { StatementsApiService } from '../../../core/api/statements-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { statementsActions } from './statements.actions';
import { statementsSelectors } from './statements.selectors';

/** Anything loaded in the last 300s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 300000;

@Injectable()
export class StatementsEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(statementsActions.load),
      concatLatestFrom(() => this.store.select(statementsSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.list().pipe(
          map(items => statementsActions.loaded({ items })),
          catchError((error: AppError) => of(statementsActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: StatementsApiService) {}
}
