import { AppError } from '../../../core/errors/app-error.model';
import { rewardsActions } from './rewards.actions';
import { initialRewardsState, rewardsReducer } from './rewards.reducer';

describe('rewardsReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = rewardsReducer(initialRewardsState, rewardsActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = rewardsReducer({ ...initialRewardsState, loading: true }, rewardsActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = rewardsReducer({ ...initialRewardsState, loading: true }, rewardsActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = rewardsReducer({ ...initialRewardsState, loadedAt: 1 }, rewardsActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = rewardsReducer(initialRewardsState, rewardsActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
