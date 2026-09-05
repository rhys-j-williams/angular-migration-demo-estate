import { createFeatureSelector, createSelector } from '@ngrx/store';

import { rewardsAdapter, rewardsFeatureKey, RewardsState } from './rewards.reducer';

const selectState = createFeatureSelector<RewardsState>(rewardsFeatureKey);
const { selectAll, selectEntities, selectTotal } = rewardsAdapter.getSelectors(selectState);

export const rewardsSelectors = {
  selectState,
  selectAll,
  selectEntities,
  selectTotal,
  selectLoading: createSelector(selectState, s => s.loading),
  selectError: createSelector(selectState, s => s.error),
  selectLoadedAt: createSelector(selectState, s => s.loadedAt),
  selectSelectedId: createSelector(selectState, s => s.selectedId),
  selectSelected: createSelector(selectState, selectEntities, (s, e) => (s.selectedId ? e[s.selectedId] : undefined)),
  selectById: (id: string) => createSelector(selectEntities, e => e[id])
};
