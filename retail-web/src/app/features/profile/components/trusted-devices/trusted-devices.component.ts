import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Devices that skip step-up; remove any. */
@Component({
  selector: 'mol-trusted-devices',
  templateUrl: './trusted-devices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustedDevicesComponent {}
