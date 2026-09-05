import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Daily external limit and remaining amount, shown beside the wizard. */
@Component({
  selector: 'mol-transfer-limits-panel',
  templateUrl: './transfer-limits-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferLimitsPanelComponent {}
