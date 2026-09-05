import { AppError } from '../../../core/errors/app-error.model';
import { profileActions } from './profile.actions';
import { initialProfileState, profileReducer } from './profile.reducer';

describe('profileReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = profileReducer(initialProfileState, profileActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = profileReducer({ ...initialProfileState, loading: true }, profileActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = profileReducer({ ...initialProfileState, loading: true }, profileActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = profileReducer({ ...initialProfileState, loadedAt: 1 }, profileActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = profileReducer(initialProfileState, profileActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
