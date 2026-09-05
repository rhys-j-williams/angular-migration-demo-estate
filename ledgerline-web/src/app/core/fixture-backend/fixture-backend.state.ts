import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { buildTreasuryDataset, TreasuryDataset } from './treasury-dataset';

/** Mutable state behind the fixture backend: one dataset per page load, reset with `reset()`. */
@Injectable({ providedIn: 'root' })
export class FixtureBackendState {
  private readonly config = inject(APP_CONFIG);
  private ticks = 0;

  dataset: TreasuryDataset = this.build();
  signedOut = false;
  latencyMs = 120;

  tick(): number {
    return this.ticks++;
  }

  private build(): TreasuryDataset {
    return buildTreasuryDataset(this.config.fixtureSeed, this.config.fixtureAsOf);
  }

  reset(): void {
    this.dataset = this.build();
    this.signedOut = false;
    this.ticks = 0;
  }
}
