import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Password change with strength rules. Untyped form. */
@Component({
  selector: 'mol-change-password',
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {}
