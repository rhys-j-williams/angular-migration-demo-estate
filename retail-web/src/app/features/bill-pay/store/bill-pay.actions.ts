import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Bill } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const billPayActions = createActionGroup({
  source: 'BillPay',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: Bill[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: Bill }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
