import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _moment from 'moment';
import { Moment } from 'moment';
// Rollup/webpack disagree about moment's default export; same dance as @angular/material-moment-adapter.
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** ISO date strings (YYYY-MM-DD). Null end means open ended. */
export interface CnDateRange {
  start: string | null;
  end: string | null;
}

export interface CnDateRangePreset {
  id: string;
  label: string;
  range: () => CnDateRange;
}

const iso = (m: Moment | null): string | null => (m && m.isValid() ? m.format('YYYY-MM-DD') : null);

export const CN_DATE_RANGE_DEFAULT_PRESETS: CnDateRangePreset[] = [
  { id: 'last30', label: 'Last 30 days', range: () => ({ start: iso(moment().subtract(30, 'days')), end: iso(moment()) }) },
  { id: 'last90', label: 'Last 90 days', range: () => ({ start: iso(moment().subtract(90, 'days')), end: iso(moment()) }) },
  { id: 'thisMonth', label: 'This month', range: () => ({ start: iso(moment().startOf('month')), end: iso(moment()) }) },
  { id: 'lastMonth', label: 'Last month', range: () => ({
      start: iso(moment().subtract(1, 'month').startOf('month')),
      end: iso(moment().subtract(1, 'month').endOf('month'))
    }) },
  { id: 'ytd', label: 'Year to date', range: () => ({ start: iso(moment().startOf('year')), end: iso(moment()) }) }
];

/**
 * Start/end date picker with the statement presets everyone asks for. Value is a pair of ISO
 * strings so it serialises straight into the transactions query. Dates are interpreted in the
 * browser's zone; the API takes care of the bank's posting-day cutoff.
 *
 *   <cn-date-range formControlName="period" [maxDate]="today" (presetApplied)="track($event)"></cn-date-range>
 */
@Component({
  selector: 'cn-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnDateRangeComponent), multi: true }],
  host: { class: 'cn-date-range' }
})
export class CnDateRangeComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label = 'Date range';
  @Input() hint: string | null = null;
  @Input() minDate: string | null = null;
  @Input() maxDate: string | null = null;
  @Input() presets: CnDateRangePreset[] = CN_DATE_RANGE_DEFAULT_PRESETS;
  @Input() showPresets = true;
  @Input() appearance: 'outline' | 'fill' = 'outline';

  @Output() readonly rangeChange = new EventEmitter<CnDateRange>();
  @Output() readonly presetApplied = new EventEmitter<CnDateRangePreset>();

  readonly form = new FormGroup({
    start: new FormControl<Moment | null>(null),
    end: new FormControl<Moment | null>(null)
  });
  activePresetId: string | null = null;
  disabled = false;

  private applyingPreset = false;
  private readonly destroy$ = new Subject<void>();
  private onChange: (v: CnDateRange) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get min(): Moment | null {
    return this.minDate ? moment(this.minDate, 'YYYY-MM-DD') : null;
  }

  get max(): Moment | null {
    return this.maxDate ? moment(this.maxDate, 'YYYY-MM-DD') : null;
  }

  get value(): CnDateRange {
    return { start: iso(this.form.controls.start.value), end: iso(this.form.controls.end.value) };
  }

  get summary(): string {
    const { start, end } = this.value;
    if (!start && !end) {
      return 'Any date';
    }
    const fmt = (s: string | null) => (s ? moment(s, 'YYYY-MM-DD').format('MMM D, YYYY') : '\u2026');
    return `${fmt(start)} \u2013 ${fmt(end)}`;
  }

  ngOnInit(): void {
    // The range input re-validates the sibling control whenever one half changes, so a single
    // setValue on the group surfaces here more than once; presets set both halves and publish once.
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.applyingPreset) {
        return;
      }
      const value = this.value;
      if (!this.matchesActivePreset(value)) {
        this.activePresetId = null;
      }
      this.publish(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyPreset(preset: CnDateRangePreset): void {
    const range = preset.range();
    this.applyingPreset = true;
    this.form.setValue({
      start: range.start ? moment(range.start, 'YYYY-MM-DD') : null,
      end: range.end ? moment(range.end, 'YYYY-MM-DD') : null
    });
    this.applyingPreset = false;
    this.activePresetId = preset.id;
    this.publish(this.value);
    this.onTouched();
    this.presetApplied.emit(preset);
  }

  clear(): void {
    this.activePresetId = null;
    this.form.setValue({ start: null, end: null });
    this.onTouched();
  }

  writeValue(value: CnDateRange | null): void {
    this.form.setValue(
      {
        start: value?.start ? moment(value.start, 'YYYY-MM-DD') : null,
        end: value?.end ? moment(value.end, 'YYYY-MM-DD') : null
      },
      { emitEvent: false }
    );
  }

  registerOnChange(fn: (v: CnDateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled ? this.form.disable({ emitEvent: false }) : this.form.enable({ emitEvent: false });
  }

  onClosed(): void {
    this.onTouched();
  }

  private publish(value: CnDateRange): void {
    this.onChange(value);
    this.rangeChange.emit(value);
  }

  private matchesActivePreset(value: CnDateRange): boolean {
    const preset = this.presets.find(p => p.id === this.activePresetId);
    if (!preset) {
      return false;
    }
    const expected = preset.range();
    return expected.start === value.start && expected.end === value.end;
  }
}
