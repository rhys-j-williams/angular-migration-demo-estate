import { createFeatureSelector, createSelector } from '@ngrx/store';

import { transfersAdapter, transfersFeatureKey, TransfersState } from './transfers.reducer';

const selectState = createFeatureSelector<TransfersState>(transfersFeatureKey);
const { selectAll, selectEntities, selectTotal } = transfersAdapter.getSelectors(selectState);

export const transfersSelectors = {
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
