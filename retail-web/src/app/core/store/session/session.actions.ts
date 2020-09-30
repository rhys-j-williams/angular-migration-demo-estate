import { createAction, props } from '@ngrx/store';

import { Profile } from '../../api/models';
import { LogoutReason } from '../../auth/session-claims.model';
import { CustomerEntitlements } from '../../entitlements/entitlements.service';
import { AppError } from '../../errors/app-error.model';

/**
 * Root session slice. Everything here is about "who is signed in and what may they do"; feature
 * state lives in the feature modules. Action naming follows the NgRx style guide: [Source] Event.
 */
export const sessionActions = {
  authenticated: createAction('[Session] Authenticated', props<{ customerId: string; displayName: string | null }>()),
  loadProfile: createAction('[Session] Load Profile'),
  profileLoaded: createAction('[Session] Profile Loaded', props<{ profile: Profile }>()),
  profileFailed: createAction('[Session] Profile Failed', props<{ error: AppError }>()),
  entitlementsLoaded: createAction('[Session] Entitlements Loaded', props<{ entitlements: CustomerEntitlements | null }>()),
  idleWarning: createAction('[Session] Idle Warning', props<{ secondsRemaining: number }>()),
  idleExtended: createAction('[Session] Idle Extended'),
  logout: createAction('[Session] Logout', props<{ reason: LogoutReason }>()),
  loggedOut: createAction('[Session] Logged Out'),
  unreadMessagesLoaded: createAction('[Session] Unread Messages Loaded', props<{ unread: number }>()),
  bannerDismissed: createAction('[Session] Banner Dismissed', props<{ bannerId: string }>())
};
