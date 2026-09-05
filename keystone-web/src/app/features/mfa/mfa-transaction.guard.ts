import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { MfaTransactionService } from '../../core/auth/mfa-transaction.service';

/** No live transaction, no MFA screen. Refresh mid-flow lands you back on the credential form. */
export const mfaTransactionGuard: CanActivateFn = () => {
  const mfa = inject(MfaTransactionService);
  const router = inject(Router);
  return mfa.snapshot ? true : router.createUrlTree(['/'], { queryParams: { error: 'login_required' } });
};
