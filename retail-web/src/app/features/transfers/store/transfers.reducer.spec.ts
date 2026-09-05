import { AppError } from '../../../core/errors/app-error.model';
import { transfersActions } from './transfers.actions';
import { initialTransfersState, transfersReducer } from './transfers.reducer';

describe('transfersReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = transfersReducer(initialTransfersState, transfersActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = transfersReducer({ ...initialTransfersState, loading: true }, transfersActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = transfersReducer({ ...initialTransfersState, loading: true }, transfersActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = transfersReducer({ ...initialTransfersState, loadedAt: 1 }, transfersActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = transfersReducer(initialTransfersState, transfersActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
