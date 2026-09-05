import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Statement } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const statementsActions = createActionGroup({
  source: 'Statements',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: Statement[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: Statement }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
