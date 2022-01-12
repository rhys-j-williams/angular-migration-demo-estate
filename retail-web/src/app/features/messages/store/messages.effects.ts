import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { MessagesApiService } from '../../../core/api/messages-api.service';
import { AppError } from '../../../core/errors/app-error.model';
import { messagesActions } from './messages.actions';
import { messagesSelectors } from './messages.selectors';

/** Anything loaded in the last 30s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = 30000;

@Injectable()
export class MessagesEffects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagesActions.load),
      concatLatestFrom(() => this.store.select(messagesSelectors.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.threads().pipe(
          map(items => messagesActions.loaded({ items })),
          catchError((error: AppError) => of(messagesActions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: MessagesApiService) {}
}
