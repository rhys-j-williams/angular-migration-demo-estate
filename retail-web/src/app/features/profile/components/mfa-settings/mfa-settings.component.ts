import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Choose SMS, authenticator or push. */
@Component({
  selector: 'mol-mfa-settings',
  templateUrl: './mfa-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MfaSettingsComponent {}
