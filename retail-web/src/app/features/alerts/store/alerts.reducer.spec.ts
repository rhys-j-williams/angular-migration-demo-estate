import { AppError } from '../../../core/errors/app-error.model';
import { alertsActions } from './alerts.actions';
import { initialAlertsState, alertsReducer } from './alerts.reducer';

describe('alertsReducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = alertsReducer(initialAlertsState, alertsActions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = alertsReducer({ ...initialAlertsState, loading: true }, alertsActions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = alertsReducer({ ...initialAlertsState, loading: true }, alertsActions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = alertsReducer({ ...initialAlertsState, loadedAt: 1 }, alertsActions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = alertsReducer(initialAlertsState, alertsActions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
