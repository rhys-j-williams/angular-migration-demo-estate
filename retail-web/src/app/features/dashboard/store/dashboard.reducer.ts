import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Account } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { dashboardActions } from './dashboard.actions';

export const dashboardFeatureKey = 'dashboard';

export interface DashboardState extends EntityState<Account> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const dashboardAdapter = createEntityAdapter<Account>({
  selectId: item => item.accountId
});

export const initialDashboardState: DashboardState = dashboardAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const dashboardReducer = createReducer(
  initialDashboardState,
  on(dashboardActions.load, state => ({ ...state, loading: true, error: null })),
  on(dashboardActions.loaded, (state, { items }) => dashboardAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(dashboardActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(dashboardActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(dashboardActions.upsert, (state, { item }) => dashboardAdapter.upsertOne(item, state)),
  on(dashboardActions.remove, (state, { id }) => dashboardAdapter.removeOne(id, state)),
  on(dashboardActions.invalidate, state => ({ ...state, loadedAt: null }))
);
