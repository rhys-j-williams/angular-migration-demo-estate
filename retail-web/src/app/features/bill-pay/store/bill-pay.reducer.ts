import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Bill } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { billPayActions } from './bill-pay.actions';

export const billPayFeatureKey = 'bill-pay';

export interface BillPayState extends EntityState<Bill> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const billPayAdapter = createEntityAdapter<Bill>({
  selectId: item => item.billId
});

export const initialBillPayState: BillPayState = billPayAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const billPayReducer = createReducer(
  initialBillPayState,
  on(billPayActions.load, state => ({ ...state, loading: true, error: null })),
  on(billPayActions.loaded, (state, { items }) => billPayAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(billPayActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(billPayActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(billPayActions.upsert, (state, { item }) => billPayAdapter.upsertOne(item, state)),
  on(billPayActions.remove, (state, { id }) => billPayAdapter.removeOne(id, state)),
  on(billPayActions.invalidate, state => ({ ...state, loadedAt: null }))
);
