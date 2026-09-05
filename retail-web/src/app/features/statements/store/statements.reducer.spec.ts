import { AppError } from '../../../core/errors/app-error.model';
import { statementsActions } from './statements.actions';
import { initialStatementsState, statementsReducer } from './statements.reducer';

describe('statementsReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = statementsReducer(initialStatementsState, statementsActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = statementsReducer({ ...initialStatementsState, loading: true }, statementsActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = statementsReducer({ ...initialStatementsState, loading: true }, statementsActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = statementsReducer({ ...initialStatementsState, loadedAt: 1 }, statementsActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = statementsReducer(initialStatementsState, statementsActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
