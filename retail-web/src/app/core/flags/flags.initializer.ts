import { APP_INITIALIZER, Provider } from '@angular/core';

import { FeatureFlagService } from './feature-flag.service';

export function bootstrapFlags(flags: FeatureFlagService): () => Promise<void> {
  return () => flags.bootstrap();
}

/** After CONFIG_INITIALIZER and AUTH_INITIALIZER. */
export const FLAGS_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: bootstrapFlags,
  deps: [FeatureFlagService],
  multi: true
};
