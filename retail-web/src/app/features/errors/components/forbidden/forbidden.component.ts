import { ChangeDetectionStrategy, Component } from '@angular/core';

/** 403. */
@Component({
  selector: 'mol-forbidden',
  templateUrl: './forbidden.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForbiddenComponent {}
