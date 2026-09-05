import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { AlertPreference } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const alertsActions = createActionGroup({
  source: 'Alerts',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: AlertPreference[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: AlertPreference }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
