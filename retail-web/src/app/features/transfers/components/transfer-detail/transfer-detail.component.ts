import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Transfer } from '../../../../core/api/models';
import { transfersActions } from '../../store/transfers.actions';
import { transfersSelectors } from '../../store/transfers.selectors';

/** One scheduled or completed transfer, with cancel where still allowed. */
@Component({
  selector: 'mol-transfer-detail',
  templateUrl: './transfer-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferDetailComponent implements OnInit {
  readonly item$: Observable<Transfer | undefined> = this.route.paramMap.pipe(
    map(p => p.get('transferId') ?? ''),
    switchMap(id => this.store.select(transfersSelectors.selectById(id)))
  );

  constructor(private readonly store: Store, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.store.dispatch(transfersActions.load());
  }
}
