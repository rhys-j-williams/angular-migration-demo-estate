import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Account } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const dashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: Account[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: Account }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
