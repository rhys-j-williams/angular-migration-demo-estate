import { ChangeDetectionStrategy, Component } from '@angular/core';

/** From, to, amount and memo. Typed reactive form. */
@Component({
  selector: 'mol-transfer-details-step',
  templateUrl: './transfer-details-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferDetailsStepComponent {}
