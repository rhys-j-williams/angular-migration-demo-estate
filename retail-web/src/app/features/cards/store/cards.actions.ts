import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Card } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const cardsActions = createActionGroup({
  source: 'Cards',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: Card[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: Card }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
