import { createFeatureSelector, createSelector } from '@ngrx/store';

import { dashboardAdapter, dashboardFeatureKey, DashboardState } from './dashboard.reducer';

const selectState = createFeatureSelector<DashboardState>(dashboardFeatureKey);
const { selectAll, selectEntities, selectTotal } = dashboardAdapter.getSelectors(selectState);

export const dashboardSelectors = {
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
