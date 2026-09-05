import { createFeatureSelector, createSelector } from '@ngrx/store';

import { alertsAdapter, alertsFeatureKey, AlertsState } from './alerts.reducer';

const selectState = createFeatureSelector<AlertsState>(alertsFeatureKey);
const { selectAll, selectEntities, selectTotal } = alertsAdapter.getSelectors(selectState);

export const alertsSelectors = {
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
