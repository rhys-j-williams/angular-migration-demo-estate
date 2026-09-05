import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Read-back before submit. Behind MfaStepUpGuard. */
@Component({
  selector: 'mol-transfer-review-step',
  templateUrl: './transfer-review-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferReviewStepComponent {}
