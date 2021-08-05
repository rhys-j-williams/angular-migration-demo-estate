import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { AlertsApiService } from '../../../core/api/alerts-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { alertsActions } from './alerts.actions';
import { alertsSelectors } from './alerts.selectors';

/** Anything loaded in the last 120s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 120000;

@Injectable()
export class AlertsEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(alertsActions.load),
      concatLatestFrom(() => this.store.select(alertsSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.preferences().pipe(
          map(items => alertsActions.loaded({ items })),
          catchError((error: AppError) => of(alertsActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: AlertsApiService) {}
}
