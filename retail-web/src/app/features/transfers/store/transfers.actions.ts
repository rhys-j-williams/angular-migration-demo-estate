import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Transfer } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const transfersActions = createActionGroup({
  source: 'Transfers',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: Transfer[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: Transfer }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
