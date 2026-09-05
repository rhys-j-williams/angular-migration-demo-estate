import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { SecureMessageThread } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { messagesActions } from './messages.actions';

export const messagesFeatureKey = 'messages';

export interface MessagesState extends EntityState<SecureMessageThread> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const messagesAdapter = createEntityAdapter<SecureMessageThread>({
  selectId: item => item.threadId,
  sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt)
});

export const initialMessagesState: MessagesState = messagesAdapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const messagesReducer = createReducer(
  initialMessagesState,
  on(messagesActions.load, state => ({ ...state, loading: true, error: null })),
  on(messagesActions.loaded, (state, { items }) => messagesAdapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(messagesActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(messagesActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(messagesActions.upsert, (state, { item }) => messagesAdapter.upsertOne(item, state)),
  on(messagesActions.remove, (state, { id }) => messagesAdapter.removeOne(id, state)),
  on(messagesActions.invalidate, state => ({ ...state, loadedAt: null }))
);
