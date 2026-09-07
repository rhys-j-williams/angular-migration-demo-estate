import { APP_INITIALIZER, Provider } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { FeatureFlagService } from './feature-flag.service';

export function bootstrapFlags(flags: FeatureFlagService, config: ConfigService): () => Promise<void> {
  return async () => {
    await lastValueFrom(config.config.pipe(take(1)));
    await flags.bootstrap();
  };
}

/** Waits for CONFIG_INITIALIZER; Angular runs APP_INITIALIZERs concurrently. */
export const FLAGS_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: bootstrapFlags,
  deps: [FeatureFlagService, ConfigService],
  multi: true
};
