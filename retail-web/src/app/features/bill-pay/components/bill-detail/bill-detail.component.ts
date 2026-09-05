import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Bill } from '../../../../core/api/models';
import { billPayActions } from '../../store/bill-pay.actions';
import { billPaySelectors } from '../../store/bill-pay.selectors';

/** One bill with eBill and autopay status. */
@Component({
  selector: 'mol-bill-detail',
  templateUrl: './bill-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillDetailComponent implements OnInit {
  readonly item$: Observable<Bill | undefined> = this.route.paramMap.pipe(
    map(p => p.get('billId') ?? ''),
    switchMap(id => this.store.select(billPaySelectors.selectById(id)))
  );

  constructor(private readonly store: Store, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.store.dispatch(billPayActions.load());
  }
}
