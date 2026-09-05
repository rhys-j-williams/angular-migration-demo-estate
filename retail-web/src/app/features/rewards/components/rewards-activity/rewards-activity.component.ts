import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { RewardsActivity } from '../../../../core/api/models';
import { rewardsActions } from '../../store/rewards.actions';
import { rewardsSelectors } from '../../store/rewards.selectors';

/** Points earned and redeemed. */
@Component({
  selector: 'mol-rewards-activity',
  templateUrl: './rewards-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsActivityComponent implements OnInit {
  readonly rows$ = this.store.select(rewardsSelectors.selectAll);
  readonly loading$ = this.store.select(rewardsSelectors.selectLoading);
  readonly error$ = this.store.select(rewardsSelectors.selectError);

  readonly columns: CnColumn<RewardsActivity>[] = [
    { key: 'at', header: $localize`:@@rewards.rewardsActivity.col.at:Date`, type: 'date' },
    { key: 'description', header: $localize`:@@rewards.rewardsActivity.col.description:Description` },
    { key: 'points', header: $localize`:@@rewards.rewardsActivity.col.points:Points`, type: 'number', align: 'end' }
  ];

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(rewardsActions.load());
  }

  reload(): void {
    this.store.dispatch(rewardsActions.load());
  }

  open(row: RewardsActivity): void {
    this.store.dispatch(rewardsActions.select({ id: row.id }));
  }
}
