import { AppError } from '../../../core/errors/app-error.model';
import { billPayActions } from './bill-pay.actions';
import { initialBillPayState, billPayReducer } from './bill-pay.reducer';

describe('billPayReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = billPayReducer(initialBillPayState, billPayActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = billPayReducer({ ...initialBillPayState, loading: true }, billPayActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = billPayReducer({ ...initialBillPayState, loading: true }, billPayActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = billPayReducer({ ...initialBillPayState, loadedAt: 1 }, billPayActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = billPayReducer(initialBillPayState, billPayActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
