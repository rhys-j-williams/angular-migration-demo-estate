import { APP_INITIALIZER, Provider } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';

export function initialiseKeystone(auth: AuthService, config: ConfigService): () => Promise<void> {
  return async () => {
    await lastValueFrom(config.config.pipe(take(1)));
    await auth.initialise();
  };
}

/** Waits for CONFIG_INITIALIZER; Angular runs APP_INITIALIZERs concurrently. */
export const AUTH_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initialiseKeystone,
  deps: [AuthService, ConfigService],
  multi: true
};
