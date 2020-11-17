import { createFeatureSelector, createSelector } from '@ngrx/store';

import { accountsAdapter, accountsFeatureKey, AccountsState } from './accounts.reducer';

const selectState = createFeatureSelector<AccountsState>(accountsFeatureKey);
const { selectAll, selectEntities, selectTotal } = accountsAdapter.getSelectors(selectState);

export const accountsSelectors = {
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
