import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { TrustedDevice } from '../../../core/device/device-trust.service';

@Component({
  selector: 'ks-trusted-device-summary',
  standalone: true,
  imports: [DatePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="ks-device">
      <div><dt>Device</dt><dd><mat-icon svgIcon="cn:check" aria-hidden="true"></mat-icon> {{ device.label }}</dd></div>
      <div><dt>Trusted since</dt><dd>{{ device.enrolledAt | date: 'mediumDate' }}</dd></div>
      <div><dt>Expires</dt><dd>{{ device.expiresAt | date: 'mediumDate' }}</dd></div>
    </dl>
  `,
  styles: [
    `
      .ks-device { display: grid; gap: 8px; margin: 16px 0; }
      .ks-device div { display: flex; justify-content: space-between; }
      dt { color: #52606d; }
      dd { margin: 0; display: inline-flex; align-items: center; gap: 4px; }
      mat-icon { color: #1e7f4f; height: 18px; width: 18px; }
    `,
  ],
})
export class TrustedDeviceSummaryComponent {
  @Input() device!: TrustedDevice;
}
