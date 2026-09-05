import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { AccountsApiService } from '../../../core/api/accounts-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { dashboardActions } from './dashboard.actions';
import { dashboardSelectors } from './dashboard.selectors';

/** Anything loaded in the last 60s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 60000;

@Injectable()
export class DashboardEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(dashboardActions.load),
      concatLatestFrom(() => this.store.select(dashboardSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.list().pipe(
          map(items => dashboardActions.loaded({ items })),
          catchError((error: AppError) => of(dashboardActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: AccountsApiService) {}
}
