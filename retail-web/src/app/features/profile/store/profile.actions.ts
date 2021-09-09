import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { TrustedDevice } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const profileActions = createActionGroup({
  source: 'Profile',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: TrustedDevice[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: TrustedDevice }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
