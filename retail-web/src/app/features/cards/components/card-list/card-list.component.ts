import { ChangeDetectionStrategy, Component } from '@angular/core';

/** All cards with status and quick lock. */
@Component({
  selector: 'mol-card-list',
  templateUrl: './card-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardListComponent {}
