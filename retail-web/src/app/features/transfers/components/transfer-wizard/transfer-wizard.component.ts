import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Stepper shell for the transfer flow; owns the draft and parks the amount for the MFA guard. */
@Component({
  selector: 'mol-transfer-wizard',
  templateUrl: './transfer-wizard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferWizardComponent {}
