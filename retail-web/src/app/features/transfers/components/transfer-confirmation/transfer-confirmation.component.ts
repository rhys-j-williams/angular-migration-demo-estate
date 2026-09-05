import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Confirmation number, arrival estimate and next actions. */
@Component({
  selector: 'mol-transfer-confirmation',
  templateUrl: './transfer-confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferConfirmationComponent {}
