import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Index of agreements with effective dates. */
@Component({
  selector: 'mol-disclosure-list',
  templateUrl: './disclosure-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclosureListComponent {}
