import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { SecureMessageThread } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const messagesActions = createActionGroup({
  source: 'Messages',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: SecureMessageThread[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: SecureMessageThread }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
