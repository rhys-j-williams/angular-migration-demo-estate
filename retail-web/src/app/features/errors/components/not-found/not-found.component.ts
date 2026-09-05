import { ChangeDetectionStrategy, Component } from '@angular/core';

/** 404. */
@Component({
  selector: 'mol-not-found',
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}
