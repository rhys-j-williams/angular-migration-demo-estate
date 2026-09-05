import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { BillPayApiService } from '../../../core/api/bill-pay-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { billPayActions } from './bill-pay.actions';
import { billPaySelectors } from './bill-pay.selectors';

/** Anything loaded in the last 120s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 120000;

@Injectable()
export class BillPayEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(billPayActions.load),
      concatLatestFrom(() => this.store.select(billPaySelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.bills().pipe(
          map(items => billPayActions.loaded({ items })),
          catchError((error: AppError) => of(billPayActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: BillPayApiService) {}
}
