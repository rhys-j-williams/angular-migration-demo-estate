import { AppError } from '../../../core/errors/app-error.model';
import { accountsActions } from './accounts.actions';
import { initialAccountsState, accountsReducer } from './accounts.reducer';

describe('accountsReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = accountsReducer(initialAccountsState, accountsActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = accountsReducer({ ...initialAccountsState, loading: true }, accountsActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = accountsReducer({ ...initialAccountsState, loading: true }, accountsActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = accountsReducer({ ...initialAccountsState, loadedAt: 1 }, accountsActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = accountsReducer(initialAccountsState, accountsActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
