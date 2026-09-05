import { createFeatureSelector, createSelector } from '@ngrx/store';

import { profileAdapter, profileFeatureKey, ProfileState } from './profile.reducer';

const selectState = createFeatureSelector<ProfileState>(profileFeatureKey);
const { selectAll, selectEntities, selectTotal } = profileAdapter.getSelectors(selectState);

export const profileSelectors = {
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
