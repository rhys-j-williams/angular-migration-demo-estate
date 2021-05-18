import { createFeatureSelector, createSelector } from '@ngrx/store';

import { cardsAdapter, cardsFeatureKey, CardsState } from './cards.reducer';

const selectState = createFeatureSelector<CardsState>(cardsFeatureKey);
const { selectAll, selectEntities, selectTotal } = cardsAdapter.getSelectors(selectState);

export const cardsSelectors = {
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
