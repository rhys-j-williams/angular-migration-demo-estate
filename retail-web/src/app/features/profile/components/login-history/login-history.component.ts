import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Recent sign-ins with location and device. */
@Component({
  selector: 'mol-login-history',
  templateUrl: './login-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginHistoryComponent {}
