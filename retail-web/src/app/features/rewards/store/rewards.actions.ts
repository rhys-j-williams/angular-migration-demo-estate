import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { RewardsActivity } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const rewardsActions = createActionGroup({
  source: 'Rewards',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: RewardsActivity[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: RewardsActivity }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
