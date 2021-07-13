import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { StepUpService } from '../../../core/auth/step-up.service';

@Component({
  selector: 'ks-step-up-reason',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ks-stepup-reason">
      <mat-icon svgIcon="cn:alert" aria-hidden="true"></mat-icon>
      <p class="ks-card__lede">{{ describe(reason) }}</p>
    </div>
  `,
  styles: [`.ks-stepup-reason { display: flex; gap: 12px; align-items: flex-start; } mat-icon { color: #b26a00; flex: 0 0 auto; }`],
})
export class StepUpReasonComponent {
  @Input() reason: string | null = null;

  constructor(private readonly stepUp: StepUpService) {}

  describe(reason: string | null): string {
    return this.stepUp.describe(reason);
  }
}
