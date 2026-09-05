import { AppError } from '../../../core/errors/app-error.model';
import { dashboardActions } from './dashboard.actions';
import { initialDashboardState, dashboardReducer } from './dashboard.reducer';

describe('dashboardReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = dashboardReducer(initialDashboardState, dashboardActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = dashboardReducer({ ...initialDashboardState, loading: true }, dashboardActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = dashboardReducer({ ...initialDashboardState, loading: true }, dashboardActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = dashboardReducer({ ...initialDashboardState, loadedAt: 1 }, dashboardActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = dashboardReducer(initialDashboardState, dashboardActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
