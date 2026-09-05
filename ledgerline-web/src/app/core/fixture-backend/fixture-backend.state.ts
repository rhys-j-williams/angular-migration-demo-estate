import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { buildTreasuryDataset, TreasuryDataset } from './treasury-dataset';

/** Mutable state behind the fixture backend: one dataset per page load, reset with `reset()`. */
@Injectable({ providedIn: 'root' })
export class FixtureBackendState {
  private readonly seed = inject(APP_CONFIG).fixtureSeed;
  private ticks = 0;

  dataset: TreasuryDataset = buildTreasuryDataset(this.seed);
  signedOut = false;
  latencyMs = 120;

  tick(): number {
    return this.ticks++;
  }

  reset(): void {
    this.dataset = buildTreasuryDataset(this.seed);
    this.signedOut = false;
    this.ticks = 0;
  }
}
