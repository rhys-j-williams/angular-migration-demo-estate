import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Read-back and agreements before submission. */
@Component({
  selector: 'mol-review-step',
  templateUrl: './review-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewStepComponent {}
