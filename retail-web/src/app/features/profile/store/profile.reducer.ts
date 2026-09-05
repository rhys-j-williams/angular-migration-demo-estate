import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { TrustedDevice } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { profileActions } from './profile.actions';

export const profileFeatureKey = 'profile';

export interface ProfileState extends EntityState<TrustedDevice> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const profileAdapter = createEntityAdapter<TrustedDevice>({
  selectId: item => item.deviceId
});

export const initialProfileState: ProfileState = profileAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const profileReducer = createReducer(
  initialProfileState,
  on(profileActions.load, state => ({ ...state, loading: true, error: null })),
  on(profileActions.loaded, (state, { items }) => profileAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(profileActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(profileActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(profileActions.upsert, (state, { item }) => profileAdapter.upsertOne(item, state)),
  on(profileActions.remove, (state, { id }) => profileAdapter.removeOne(id, state)),
  on(profileActions.invalidate, state => ({ ...state, loadedAt: null }))
);
