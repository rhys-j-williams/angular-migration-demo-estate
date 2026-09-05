import { Routes } from '@angular/router';

import { RecoveryDoneComponent } from './recovery-done/recovery-done.component';
import { RecoveryStartComponent } from './recovery-start/recovery-start.component';
import { RecoveryVerifyComponent } from './recovery-verify/recovery-verify.component';

/**
 * Username recovery. All standalone MDC since KEY-2216 (it was the second thing migrated because
 * it has the fewest visitors and therefore the fewest people to notice). Also has no tests, which
 * is the other reason it was easy to migrate. See RecoveryService for the TODO.
 */
export const RECOVERY_ROUTES: Routes = [
  { path: '', component: RecoveryStartComponent },
  { path: 'verify', component: RecoveryVerifyComponent },
  { path: 'done', component: RecoveryDoneComponent },
];
