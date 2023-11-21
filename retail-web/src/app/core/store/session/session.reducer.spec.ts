import { sessionActions } from './session.actions';
import { initialSessionState, sessionReducer } from './session.reducer';

describe('sessionReducer', () => {
  it('records the signed in customer', () => {
    const state = sessionReducer(initialSessionState, sessionActions.authenticated({ customerId: 'CUS-1', displayName: 'Dana' }));
    expect(state.authenticated).toBeTrue();
    expect(state.customerId).toBe('CUS-1');
    expect(state.displayName).toBe('Dana');
  });

  it('keeps the Keystone display name when the profile has no first name', () => {
    const signedIn = sessionReducer(initialSessionState, sessionActions.authenticated({ customerId: 'CUS-1', displayName: 'D. K.' }));
    const state = sessionReducer(signedIn, sessionActions.profileLoaded({ profile: { firstName: '' } as never }));
    expect(state.displayName).toBe('D. K.');
    expect(state.profileError).toBeNull();
  });

  it('dismisses a banner once', () => {
    const a = sessionReducer(initialSessionState, sessionActions.bannerDismissed({ bannerId: 'paylink-fee-2024' }));
    const b = sessionReducer(a, sessionActions.bannerDismissed({ bannerId: 'paylink-fee-2024' }));
    expect(b.dismissedBanners).toEqual(['paylink-fee-2024']);
    expect(b).toBe(a);
  });

  it('tracks idle warning and extension', () => {
    const warned = sessionReducer(initialSessionState, sessionActions.idleWarning({ secondsRemaining: 120 }));
    expect(warned.idleWarningSeconds).toBe(120);
    expect(sessionReducer(warned, sessionActions.idleExtended()).idleWarningSeconds).toBeNull();
  });

  it('wipes everything on logout', () => {
    const busy = sessionReducer(
      sessionReducer(initialSessionState, sessionActions.authenticated({ customerId: 'CUS-1', displayName: null })),
      sessionActions.unreadMessagesLoaded({ unread: 3 })
    );
    expect(sessionReducer(busy, sessionActions.loggedOut())).toEqual(initialSessionState);
  });
});
