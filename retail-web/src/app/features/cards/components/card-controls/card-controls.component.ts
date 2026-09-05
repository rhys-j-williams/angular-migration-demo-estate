import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Per-card spend controls. */
@Component({
  selector: 'mol-card-controls',
  templateUrl: './card-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardControlsComponent {}
