import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Card } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { cardsActions } from './cards.actions';

export const cardsFeatureKey = 'cards';

export interface CardsState extends EntityState<Card> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const cardsAdapter = createEntityAdapter<Card>({
  selectId: item => item.cardId
});

export const initialCardsState: CardsState = cardsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const cardsReducer = createReducer(
  initialCardsState,
  on(cardsActions.load, state => ({ ...state, loading: true, error: null })),
  on(cardsActions.loaded, (state, { items }) => cardsAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(cardsActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(cardsActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(cardsActions.upsert, (state, { item }) => cardsAdapter.upsertOne(item, state)),
  on(cardsActions.remove, (state, { id }) => cardsAdapter.removeOne(id, state)),
  on(cardsActions.invalidate, state => ({ ...state, loadedAt: null }))
);
