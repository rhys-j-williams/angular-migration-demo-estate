import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { TransfersApiService } from '../../../core/api/transfers-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { transfersActions } from './transfers.actions';
import { transfersSelectors } from './transfers.selectors';

/** Anything loaded in the last 30s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 30000;

@Injectable()
export class TransfersEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(transfersActions.load),
      concatLatestFrom(() => this.store.select(transfersSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.scheduled().pipe(
          map(items => transfersActions.loaded({ items })),
          catchError((error: AppError) => of(transfersActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: TransfersApiService) {}
}
