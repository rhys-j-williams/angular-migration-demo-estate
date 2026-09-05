import { createSelector } from '@ngrx/store';

import { selectEntitlements, selectIdleWarningSeconds, selectProfile } from './session.reducer';

export const selectHasEntitlement = (product: string) =>
  createSelector(selectEntitlements, e => (e ? e.products.includes(product) : false));

export const selectIsIdleWarning = createSelector(selectIdleWarningSeconds, s => s !== null);

export const selectGreetingName = createSelector(selectProfile, p => p?.firstName ?? null);

export const selectIsBusinessCustomer = createSelector(selectProfile, p => p?.segment !== undefined && p.segment !== 'consumer');

export const selectPreferredLanguage = createSelector(selectProfile, p => p?.preferredLanguage ?? 'en');
