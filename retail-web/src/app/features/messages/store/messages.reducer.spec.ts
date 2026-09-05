import { AppError } from '../../../core/errors/app-error.model';
import { messagesActions } from './messages.actions';
import { initialMessagesState, messagesReducer } from './messages.reducer';

describe('messagesReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = messagesReducer(initialMessagesState, messagesActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = messagesReducer({ ...initialMessagesState, loading: true }, messagesActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = messagesReducer({ ...initialMessagesState, loading: true }, messagesActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = messagesReducer({ ...initialMessagesState, loadedAt: 1 }, messagesActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = messagesReducer(initialMessagesState, messagesActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
