import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { RewardsActivity } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { rewardsActions } from './rewards.actions';

export const rewardsFeatureKey = 'rewards';

export interface RewardsState extends EntityState<RewardsActivity> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const rewardsAdapter = createEntityAdapter<RewardsActivity>({
  selectId: item => item.id
});

export const initialRewardsState: RewardsState = rewardsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const rewardsReducer = createReducer(
  initialRewardsState,
  on(rewardsActions.load, state => ({ ...state, loading: true, error: null })),
  on(rewardsActions.loaded, (state, { items }) => rewardsAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(rewardsActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(rewardsActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(rewardsActions.upsert, (state, { item }) => rewardsAdapter.upsertOne(item, state)),
  on(rewardsActions.remove, (state, { id }) => rewardsAdapter.removeOne(id, state)),
  on(rewardsActions.invalidate, state => ({ ...state, loadedAt: null }))
);
