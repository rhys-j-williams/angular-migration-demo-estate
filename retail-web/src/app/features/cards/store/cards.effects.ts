import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { CardsApiService } from '../../../core/api/cards-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { cardsActions } from './cards.actions';
import { cardsSelectors } from './cards.selectors';

/** Anything loaded in the last 120s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 120000;

@Injectable()
export class CardsEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cardsActions.load),
      concatLatestFrom(() => this.store.select(cardsSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.list().pipe(
          map(items => cardsActions.loaded({ items })),
          catchError((error: AppError) => of(cardsActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: CardsApiService) {}
}
