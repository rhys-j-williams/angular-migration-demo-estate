import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Account } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { accountsActions } from './accounts.actions';

export const accountsFeatureKey = 'accounts';

export interface AccountsState extends EntityState<Account> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const accountsAdapter = createEntityAdapter<Account>({
  selectId: item => item.accountId,
  sortComparer: (a, b) => a.nickname.localeCompare(b.nickname)
});

export const initialAccountsState: AccountsState = accountsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const accountsReducer = createReducer(
  initialAccountsState,
  on(accountsActions.load, state => ({ ...state, loading: true, error: null })),
  on(accountsActions.loaded, (state, { items }) => accountsAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(accountsActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(accountsActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(accountsActions.upsert, (state, { item }) => accountsAdapter.upsertOne(item, state)),
  on(accountsActions.remove, (state, { id }) => accountsAdapter.removeOne(id, state)),
  on(accountsActions.invalidate, state => ({ ...state, loadedAt: null }))
);
