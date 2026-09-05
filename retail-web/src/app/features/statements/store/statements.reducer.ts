import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Statement } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { statementsActions } from './statements.actions';

export const statementsFeatureKey = 'statements';

export interface StatementsState extends EntityState<Statement> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const statementsAdapter = createEntityAdapter<Statement>({
  selectId: item => item.statementId
});

export const initialStatementsState: StatementsState = statementsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const statementsReducer = createReducer(
  initialStatementsState,
  on(statementsActions.load, state => ({ ...state, loading: true, error: null })),
  on(statementsActions.loaded, (state, { items }) => statementsAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(statementsActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(statementsActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(statementsActions.upsert, (state, { item }) => statementsAdapter.upsertOne(item, state)),
  on(statementsActions.remove, (state, { id }) => statementsAdapter.removeOne(id, state)),
  on(statementsActions.invalidate, state => ({ ...state, loadedAt: null }))
);
