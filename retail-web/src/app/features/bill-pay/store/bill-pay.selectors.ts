import { createFeatureSelector, createSelector } from '@ngrx/store';

import { billPayAdapter, billPayFeatureKey, BillPayState } from './bill-pay.reducer';

const selectState = createFeatureSelector<BillPayState>(billPayFeatureKey);
const { selectAll, selectEntities, selectTotal } = billPayAdapter.getSelectors(selectState);

export const billPaySelectors = {
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
