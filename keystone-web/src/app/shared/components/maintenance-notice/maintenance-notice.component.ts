import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '../../../../environments/environment';
import { MaintenanceWindow } from '../../../../environments/environment.model';

/**
 * Planned maintenance strip. The window is baked into the environment file at build time, which is
 * why it is always null in this repo and why the comms team asks us to do a release to turn it on.
 * KEY-1990 was going to move it to a BFF flag. It did not.
 */
@Component({
  selector: 'ks-maintenance-notice',
  standalone: true,
  imports: [NgIf, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside *ngIf="window as w" class="ks-maint" role="note">
      <mat-icon svgIcon="cn:info" aria-hidden="true"></mat-icon>
      <span>{{ w.message }}</span>
    </aside>
  `,
  styles: [`.ks-maint { align-items: center; background: #e3ecf2; color: #0b3d5c; display: flex; font-size: 14px; gap: 8px; justify-content: center; padding: 8px 16px; }`],
})
export class MaintenanceNoticeComponent {
  readonly window: MaintenanceWindow | null = activeWindow(environment.maintenanceWindow);
}

export function activeWindow(w: MaintenanceWindow | null, now: number = Date.now()): MaintenanceWindow | null {
  if (!w) {
    return null;
  }
  const start = Date.parse(w.startsAt);
  const end = Date.parse(w.endsAt);
  // Show from 24h before the window until it closes.
  return now >= start - 86400000 && now <= end ? w : null;
}
