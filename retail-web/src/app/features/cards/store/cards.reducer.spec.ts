import { AppError } from '../../../core/errors/app-error.model';
import { cardsActions } from './cards.actions';
import { initialCardsState, cardsReducer } from './cards.reducer';

describe('cardsReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = cardsReducer(initialCardsState, cardsActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = cardsReducer({ ...initialCardsState, loading: true }, cardsActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = cardsReducer({ ...initialCardsState, loading: true }, cardsActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = cardsReducer({ ...initialCardsState, loadedAt: 1 }, cardsActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = cardsReducer(initialCardsState, cardsActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
