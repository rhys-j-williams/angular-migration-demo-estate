import { createFeatureSelector, createSelector } from '@ngrx/store';

import { messagesAdapter, messagesFeatureKey, MessagesState } from './messages.reducer';

const selectState = createFeatureSelector<MessagesState>(messagesFeatureKey);
const { selectAll, selectEntities, selectTotal } = messagesAdapter.getSelectors(selectState);

export const messagesSelectors = {
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
