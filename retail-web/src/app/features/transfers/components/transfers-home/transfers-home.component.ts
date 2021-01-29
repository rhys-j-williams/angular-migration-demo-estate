import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { FeatureFlagService } from '../../../../core/flags/feature-flag.service';
import { EntitlementsService } from '../../../../core/entitlements/entitlements.service';
import { transfersActions } from '../../store/transfers.actions';
import { transfersSelectors } from '../../store/transfers.selectors';

/** Landing: new transfer entry points, scheduled list and recent history tabs. */
@Component({
  selector: 'mol-transfers-home',
  templateUrl: './transfers-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransfersHomeComponent implements OnInit {
  readonly scheduledCount$ = this.store.select(transfersSelectors.selectTotal);
  readonly wiresEnabled$ = this.flags.isEnabled$('mol.transfers.wires');
  readonly externalEntitled$ = this.entitlements.has$('external-transfers');
  tab = 0;

  constructor(
    private readonly store: Store,
    private readonly flags: FeatureFlagService,
    private readonly entitlements: EntitlementsService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(transfersActions.load());
  }
}
