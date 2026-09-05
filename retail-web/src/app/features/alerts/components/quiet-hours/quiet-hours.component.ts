import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertPreference } from '../../../../core/api/models';
import { alertsActions } from '../../store/alerts.actions';
import { alertsSelectors } from '../../store/alerts.selectors';

interface QuietHoursForm {
  enabled: FormControl<boolean>;
  start: FormControl<string>;
  end: FormControl<string>;
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Do-not-disturb window for non-regulatory alerts. The BFF stores quiet hours per alert (legacy
 * of the 2019 notifications schema), so one window is fanned out to every optional alert. Times
 * are in the customer's profile time zone, which today is always Eastern (MOL-2201 never landed).
 */
@Component({
  selector: 'mol-quiet-hours',
  templateUrl: './quiet-hours.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuietHoursComponent implements OnInit {
  readonly form: FormGroup<QuietHoursForm> = this.fb.group({
    enabled: this.fb.control(false),
    start: this.fb.control('22:00', [Validators.required, Validators.pattern(TIME)]),
    end: this.fb.control('07:00', [Validators.required, Validators.pattern(TIME)])
  });
  saving = false;
  private optional: AlertPreference[] = [];

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly store: Store,
    private readonly api: AlertsApiService,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.store.dispatch(alertsActions.load());
    this.store.select(alertsSelectors.selectAll).pipe(filter(list => list.length > 0), take(1)).subscribe(list => {
      this.optional = list.filter(p => !p.regulatory);
      const withWindow = this.optional.find(p => p.quietHours);
      if (withWindow?.quietHours) {
        this.form.patchValue({ enabled: true, start: withWindow.quietHours.start, end: withWindow.quietHours.end });
      }
      this.cdr.markForCheck();
    });
  }

  get spansMidnight(): boolean {
    const { start, end } = this.form.getRawValue();
    return start > end;
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    const { enabled, start, end } = this.form.getRawValue();
    const quietHours = enabled ? { start, end } : undefined;
    this.saving = true;
    forkJoin(this.optional.map(p => this.api.updatePreference(p.alertId, { quietHours }))).subscribe({
      next: saved => {
        saved.forEach(item => this.store.dispatch(alertsActions.upsert({ item })));
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success(enabled ? $localize`:@@alerts.quiet.saved:Quiet hours saved` : $localize`:@@alerts.quiet.cleared:Quiet hours turned off`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.toast.error($localize`:@@alerts.quiet.failed:We could not save quiet hours. Try again in a moment.`);
        this.cdr.markForCheck();
      }
    });
  }
}
