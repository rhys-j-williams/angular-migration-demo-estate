import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

import { CnRadioOption } from '@meridian/canopy-ui/forms';

import { TransferFrequency, TransferLimits } from '../../../../core/api/models';
import { ConfigService } from '../../../../core/config/config.service';
import { TransferDraftService } from '../../services/transfer-draft.service';

export interface ScheduleForm {
  when: FormControl<'now' | 'later'>;
  scheduledFor: FormControl<string>;
  frequency: FormControl<TransferFrequency>;
  endAfterOccurrences: FormControl<number | null>;
}

/**
 * Date and frequency with cutoff handling. "Today" after the cutoff silently becomes the next
 * business day; the review step spells that out so nobody is surprised (complaint CMP-2023-118).
 */
@Component({
  selector: 'mol-transfer-schedule-step',
  templateUrl: './transfer-schedule-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferScheduleStepComponent implements OnInit {
  @Input() limits!: TransferLimits;

  readonly form: FormGroup<ScheduleForm> = this.fb.group({
    when: this.fb.control<'now' | 'later'>('now'),
    scheduledFor: this.fb.control(''),
    frequency: this.fb.control<TransferFrequency>('once'),
    endAfterOccurrences: this.fb.control<number | null>(null, [Validators.min(2), Validators.max(60)])
  });

  readonly whenOptions: CnRadioOption<'now' | 'later'>[] = [
    { value: 'now', label: 'As soon as possible' },
    { value: 'later', label: 'On a date I choose' }
  ];
  readonly frequencyOptions: CnRadioOption<TransferFrequency>[] = [
    { value: 'once', label: 'Once' },
    { value: 'weekly', label: 'Every week' },
    { value: 'biweekly', label: 'Every two weeks' },
    { value: 'monthly', label: 'Every month', description: 'On the same day each month; the 29th to 31st fall back to the last day.' }
  ];

  constructor(private readonly fb: NonNullableFormBuilder, private readonly draft: TransferDraftService, private readonly config: ConfigService) {}

  ngOnInit(): void {
    const d = this.draft.value;
    this.form.patchValue({
      when: d.scheduledFor ? 'later' : 'now',
      scheduledFor: d.scheduledFor ?? '',
      frequency: d.frequency,
      endAfterOccurrences: d.endAfterOccurrences
    });
  }

  get minDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get afterCutoff(): boolean {
    return TransferScheduleStepComponent.isAfterCutoff(new Date(), this.config.value.transfers.cutoffLocalTime, this.config.value.transfers.cutoffTimeZone);
  }

  get effectiveDate(): string {
    const v = this.form.getRawValue();
    if (v.when === 'later' && v.scheduledFor) return v.scheduledFor;
    if (this.draft.value.type === 'internal') return this.minDate;
    return this.afterCutoff ? this.limits.nextBusinessDay : this.minDate;
  }

  commit(): boolean {
    const v = this.form.getRawValue();
    if (v.when === 'later' && (!v.scheduledFor || v.scheduledFor < this.minDate)) {
      this.form.controls.scheduledFor.setErrors({ pastDate: true });
      this.form.markAllAsTouched();
      return false;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    this.draft.patch({
      scheduledFor: this.effectiveDate,
      frequency: v.frequency,
      endAfterOccurrences: v.frequency === 'once' ? null : v.endAfterOccurrences
    });
    return true;
  }

  static isAfterCutoff(now: Date, cutoffLocalTime: string, timeZone: string): boolean {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    const hh = Number(parts.find(p => p.type === 'hour')?.value ?? '0') % 24;
    const mm = Number(parts.find(p => p.type === 'minute')?.value ?? '0');
    const [ch, cm] = cutoffLocalTime.split(':').map(Number);
    return hh > ch || (hh === ch && mm >= cm);
  }
}
