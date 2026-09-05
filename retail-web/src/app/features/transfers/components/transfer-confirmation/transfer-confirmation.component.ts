import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Transfer } from '../../../../core/api/models';
import { transfersSelectors } from '../../store/transfers.selectors';

/** Confirmation number, arrival estimate and next actions. Reads from the store first, then the BFF. */
@Component({
  selector: 'mol-transfer-confirmation',
  templateUrl: './transfer-confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferConfirmationComponent {
  readonly transfer$: Observable<Transfer> = this.route.paramMap.pipe(
    map(p => p.get('transferId') ?? ''),
    switchMap(id => this.store.select(transfersSelectors.selectById(id)).pipe(switchMap(t => (t ? [t] : this.api.byId(id)))))
  );

  constructor(private readonly route: ActivatedRoute, private readonly store: Store, private readonly api: TransfersApiService) {}

  headline(t: Transfer): string {
    switch (t.status) {
      case 'completed': return $localize`:@@transfers.confirm.completed:Transfer complete`;
      case 'scheduled': return $localize`:@@transfers.confirm.scheduled:Transfer scheduled`;
      case 'failed': return $localize`:@@transfers.confirm.failed:We could not send this transfer`;
      default: return $localize`:@@transfers.confirm.pending:Transfer submitted`;
    }
  }

  print(): void {
    window.print();
  }
}
