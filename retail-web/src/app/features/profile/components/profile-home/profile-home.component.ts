import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Overview with contact summary and security posture. */
@Component({
  selector: 'mol-profile-home',
  templateUrl: './profile-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileHomeComponent {}
