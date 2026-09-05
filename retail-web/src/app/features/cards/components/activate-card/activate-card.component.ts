import { ChangeDetectionStrategy, Component } from '@angular/core';

/** New card activation. */
@Component({
  selector: 'mol-activate-card',
  templateUrl: './activate-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivateCardComponent {}
