import { createFeature, createReducer, on } from '@ngrx/store';

import { Profile } from '../../api/models';
import { CustomerEntitlements } from '../../entitlements/entitlements.service';
import { AppError } from '../../errors/app-error.model';
import { sessionActions } from './session.actions';

export interface SessionState {
  authenticated: boolean;
  customerId: string | null;
  displayName: string | null;
  profile: Profile | null;
  profileError: AppError | null;
  entitlements: CustomerEntitlements | null;
  idleWarningSeconds: number | null;
  unreadMessages: number;
  dismissedBanners: string[];
}

export const initialSessionState: SessionState = {
  authenticated: false,
  customerId: null,
  displayName: null,
  profile: null,
  profileError: null,
  entitlements: null,
  idleWarningSeconds: null,
  unreadMessages: 0,
  dismissedBanners: []
};

export const sessionFeature = createFeature({
  name: 'session',
  reducer: createReducer(
    initialSessionState,
    on(sessionActions.authenticated, (state, { customerId, displayName }) => ({ ...state, authenticated: true, customerId, displayName })),
    on(sessionActions.profileLoaded, (state, { profile }) => ({
      ...state,
      profile,
      profileError: null,
      displayName: profile.firstName || state.displayName
    })),
    on(sessionActions.profileFailed, (state, { error }) => ({ ...state, profileError: error })),
    on(sessionActions.entitlementsLoaded, (state, { entitlements }) => ({ ...state, entitlements })),
    on(sessionActions.idleWarning, (state, { secondsRemaining }) => ({ ...state, idleWarningSeconds: secondsRemaining })),
    on(sessionActions.idleExtended, state => ({ ...state, idleWarningSeconds: null })),
    on(sessionActions.unreadMessagesLoaded, (state, { unread }) => ({ ...state, unreadMessages: unread })),
    on(sessionActions.bannerDismissed, (state, { bannerId }) =>
      state.dismissedBanners.includes(bannerId) ? state : { ...state, dismissedBanners: [...state.dismissedBanners, bannerId] }
    ),
    on(sessionActions.loggedOut, () => initialSessionState)
  )
});

export const {
  name: sessionFeatureKey,
  reducer: sessionReducer,
  selectSessionState,
  selectAuthenticated,
  selectCustomerId,
  selectDisplayName,
  selectProfile,
  selectProfileError,
  selectEntitlements,
  selectIdleWarningSeconds,
  selectUnreadMessages,
  selectDismissedBanners
} = sessionFeature;
