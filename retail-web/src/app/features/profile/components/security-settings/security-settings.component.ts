import { ChangeDetectionStrategy, Component } from '@angular/core';

/** MFA method, password age, username, devices, login history. */
@Component({
  selector: 'mol-security-settings',
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent {}
