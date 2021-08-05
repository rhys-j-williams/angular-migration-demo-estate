import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { AlertPreference } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { alertsActions } from './alerts.actions';

export const alertsFeatureKey = 'alerts';

export interface AlertsState extends EntityState<AlertPreference> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const alertsAdapter = createEntityAdapter<AlertPreference>({
  selectId: item => item.alertId
});

export const initialAlertsState: AlertsState = alertsAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const alertsReducer = createReducer(
  initialAlertsState,
  on(alertsActions.load, state => ({ ...state, loading: true, error: null })),
  on(alertsActions.loaded, (state, { items }) => alertsAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(alertsActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(alertsActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(alertsActions.upsert, (state, { item }) => alertsAdapter.upsertOne(item, state)),
  on(alertsActions.remove, (state, { id }) => alertsAdapter.removeOne(id, state)),
  on(alertsActions.invalidate, state => ({ ...state, loadedAt: null }))
);
