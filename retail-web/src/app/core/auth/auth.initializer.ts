import { APP_INITIALIZER, Provider } from '@angular/core';

import { AuthService } from './auth.service';

export function initialiseKeystone(auth: AuthService): () => Promise<void> {
  return () => auth.initialise();
}

/** Must be registered after CONFIG_INITIALIZER. */
export const AUTH_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initialiseKeystone,
  deps: [AuthService],
  multi: true
};
