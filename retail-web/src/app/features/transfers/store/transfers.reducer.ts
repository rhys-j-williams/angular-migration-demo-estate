import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Transfer } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { transfersActions } from './transfers.actions';

export const transfersFeatureKey = 'transfers';

export interface TransfersState extends EntityState<Transfer> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const transfersAdapter = createEntityAdapter<Transfer>({
  selectId: item => item.transferId
});

export const initialTransfersState: TransfersState = transfersAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const transfersReducer = createReducer(
  initialTransfersState,
  on(transfersActions.load, state => ({ ...state, loading: true, error: null })),
  on(transfersActions.loaded, (state, { items }) => transfersAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(transfersActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(transfersActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(transfersActions.upsert, (state, { item }) => transfersAdapter.upsertOne(item, state)),
  on(transfersActions.remove, (state, { id }) => transfersAdapter.removeOne(id, state)),
  on(transfersActions.invalidate, state => ({ ...state, loadedAt: null }))
);
