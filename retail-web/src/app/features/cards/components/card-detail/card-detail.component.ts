import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Card artwork, status, controls entry and reveal. */
@Component({
  selector: 'mol-card-detail',
  templateUrl: './card-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardDetailComponent {}
