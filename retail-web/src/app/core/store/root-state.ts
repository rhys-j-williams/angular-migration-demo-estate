import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import { environment } from '../../../environments/environment';
import { sessionFeatureKey, sessionReducer, SessionState } from './session/session.reducer';

/**
 * Root state is deliberately small: router and session. Feature slices register themselves with
 * StoreModule.forFeature in their own modules so the lazy chunks own their reducers.
 */
export interface RootState {
  router: RouterReducerState;
  [sessionFeatureKey]: SessionState;
}

export const rootReducers: ActionReducerMap<RootState> = {
  router: routerReducer,
  [sessionFeatureKey]: sessionReducer
};

/**
 * Logs action types (not payloads - they contain balances) in non-production builds. The devtools
 * extension is the better tool; this is for the UAT box where extensions are blocked by policy.
 */
export function actionLogger<S>(reducer: (state: S | undefined, action: { type: string }) => S) {
  return (state: S | undefined, action: { type: string }): S => {
    if (!environment.production && environment.logLevel === 'debug') {
      console.warn('[mol.store]', action.type);
    }
    return reducer(state, action);
  };
}

export const rootMetaReducers: MetaReducer<RootState>[] = environment.production ? [] : [actionLogger];
