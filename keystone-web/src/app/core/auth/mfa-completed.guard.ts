import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTelemetryService } from '../telemetry/auth-telemetry.service';

/**
 * Device trust may only be offered straight after a passed second factor. We cannot see the IdP
 * session from here (HttpOnly cookie on the IdP origin), so the signal is the `next` query param
 * carrying the IdP's redirect: OtpChallengeComponent only puts that there on success. Weak, known,
 * accepted in GIS-1490 because the BFF re-checks amr before it stores anything.
 */
export const mfaCompletedGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const telemetry = inject(AuthTelemetryService);
  if (route.queryParamMap.has('next')) {
    return true;
  }
  telemetry.record('device.guard_rejected');
  return router.createUrlTree(['/']);
};
