import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { CnDialogService, CnToastService } from '@meridian/canopy-ui/overlays';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { TrustedDevice } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { profileActions } from '../../store/profile.actions';
import { profileSelectors } from '../../store/profile.selectors';

/** Devices that skip step-up; remove any. Backed by the profile entity store (TrustedDevice). */
@Component({
  selector: 'mol-trusted-devices',
  templateUrl: './trusted-devices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustedDevicesComponent implements OnInit {
  readonly devices$ = this.store.select(profileSelectors.selectAll);
  readonly loading$ = this.store.select(profileSelectors.selectLoading);
  readonly error$ = this.store.select(profileSelectors.selectError);

  constructor(
    private readonly store: Store,
    private readonly api: ProfileApiService,
    private readonly dialog: CnDialogService,
    private readonly toast: CnToastService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(profileActions.load());
  }

  retry(): void {
    this.store.dispatch(profileActions.invalidate());
    this.store.dispatch(profileActions.load());
  }

  icon(d: TrustedDevice): string {
    const p = d.platform.toLowerCase();
    if (p.includes('ios') || p.includes('android')) return 'smartphone';
    if (p.includes('ipad') || p.includes('tablet')) return 'tablet';
    return 'computer';
  }

  remove(d: TrustedDevice): void {
    this.dialog
      .confirm({
        title: $localize`:@@profile.devices.removeTitle:Remove ${d.label}:device:?`,
        message: d.current
          ? $localize`:@@profile.devices.removeCurrent:This is the device you are using now. You will be asked for a verification code next time you sign in here.`
          : $localize`:@@profile.devices.removeOther:That device will need a verification code the next time it signs in.`,
        confirmLabel: $localize`:@@action.remove:Remove`,
        destructive: true
      })
      .subscribe(ok => {
        if (!ok) return;
        this.api.removeDevice(d.deviceId).subscribe({
          next: remaining => {
            this.store.dispatch(profileActions.loaded({ items: remaining }));
            this.toast.success($localize`:@@profile.devices.removed:Device removed`);
          },
          error: (err: AppError) => this.toast.error(err.title)
        });
      });
  }

  trackById(_: number, d: TrustedDevice): string {
    return d.deviceId;
  }
}
