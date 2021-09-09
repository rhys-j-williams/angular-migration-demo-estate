import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { ProfileApiService } from '../../../core/api/profile-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { profileActions } from './profile.actions';
import { profileSelectors } from './profile.selectors';

/** Anything loaded in the last 120s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 120000;

@Injectable()
export class ProfileEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.load),
      concatLatestFrom(() => this.store.select(profileSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.trustedDevices().pipe(
          map(items => profileActions.loaded({ items })),
          catchError((error: AppError) => of(profileActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: ProfileApiService) {}
}
