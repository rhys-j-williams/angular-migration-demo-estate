import { createFeatureSelector, createSelector } from '@ngrx/store';

import { statementsAdapter, statementsFeatureKey, StatementsState } from './statements.reducer';

const selectState = createFeatureSelector<StatementsState>(statementsFeatureKey);
const { selectAll, selectEntities, selectTotal } = statementsAdapter.getSelectors(selectState);

export const statementsSelectors = {
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
