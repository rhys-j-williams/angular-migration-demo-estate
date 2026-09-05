import { ChangeDetectionStrategy, Component } from '@angular/core';

/** One-step transfer between the customer's own accounts, under the MFA threshold only. */
@Component({
  selector: 'mol-quick-transfer',
  templateUrl: './quick-transfer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickTransferComponent {}
