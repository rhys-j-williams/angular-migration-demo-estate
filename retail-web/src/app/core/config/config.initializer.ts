import { APP_INITIALIZER, Provider } from '@angular/core';

import { ConfigService } from './config.service';

export function loadRuntimeConfig(config: ConfigService): () => Promise<unknown> {
  return () => config.load();
}

/**
 * First initializer in the chain. Everything else (Keystone discovery, Semaphore bootstrap,
 * Lantern) reads ConfigService.value and therefore has to come after this one; Angular runs
 * APP_INITIALIZER providers in registration order and awaits each promise, so order in
 * core.module.ts matters.
 */
export const CONFIG_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: loadRuntimeConfig,
  deps: [ConfigService],
  multi: true
};
