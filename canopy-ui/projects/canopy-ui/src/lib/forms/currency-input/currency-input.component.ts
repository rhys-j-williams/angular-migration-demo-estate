import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component, DoCheck, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, Self, ViewChild, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { CN_CONFIG, CnConfig } from '@meridian/canopy-ui/core';
import { CnCurrencyFormatService } from '@meridian/canopy-ui/core';

let nextId = 0;

/**
 * Money input. Stores a number (major units, two decimal places) on the form control and shows a
 * locale formatted string while the field is not focused. On focus it drops the grouping so the
 * customer can edit digits; on blur it re-formats.
 *
 *   <mat-form-field appearance="outline">
 *     <mat-label>Amount</mat-label>
 *     <cn-currency-input formControlName="amount" currency="USD" [max]="available"></cn-currency-input>
 *     <mat-hint>Available {{ available | cnCurrency }}</mat-hint>
 *   </mat-form-field>
 *
 * Implements MatFormFieldControl so the label floats and the error state follows the control, and
 * ControlValueAccessor so it sits in reactive forms like any other input. Negative values are
 * rejected unless `allowNegative` is set (refunds in Ledgerline, CNPY-1288).
 */
@Component({
  selector: 'cn-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MatFormFieldControl, useExisting: CnCurrencyInputComponent }],
  host: {
    class: 'cn-currency-input',
    '[class.cn-currency-input--focused]': 'focused',
    '[attr.aria-describedby]': 'describedBy || null'
  }
})
export class CnCurrencyInputComponent
  implements ControlValueAccessor, MatFormFieldControl<number>, OnInit, DoCheck, OnDestroy {

  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_required: boolean | string | null | undefined;

  @ViewChild('input', { static: true }) inputRef!: ElementRef<HTMLInputElement>;

  @Input() currency: string;
  @Input() locale: string;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() allowNegative = false;
  @Input() showSymbol = true;

  readonly stateChanges = new Subject<void>();
  readonly controlType = 'cn-currency-input';
  readonly autofilled = false;
  @HostBinding() readonly id = `cn-currency-input-${nextId++}`;
  focused = false;
  errorState = false;
  describedBy = '';
  display = '';

  private _value: number | null = null;
  private _placeholder = '';
  private _required = false;
  private _disabled = false;
  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    private readonly formatter: CnCurrencyFormatService,
    private readonly focusMonitor: FocusMonitor,
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(CN_CONFIG) config: CnConfig,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() private readonly parentForm: NgForm,
    @Optional() private readonly parentFormGroup: FormGroupDirective
  ) {
    this.currency = config.currency;
    this.locale = config.locale;
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  @Input()
  get value(): number | null {
    return this._value;
  }
  set value(v: number | null) {
    this._value = v;
    this.display = this.formatDisplay(v);
    this.stateChanges.next();
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(v: string) {
    this._placeholder = v;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(v: boolean) {
    this._required = coerceBooleanProperty(v);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: boolean) {
    this._disabled = coerceBooleanProperty(v);
    this.stateChanges.next();
  }

  get empty(): boolean {
    return this._value === null && !this.display;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get symbol(): string {
    return this.formatter.symbol(this.currency, this.locale);
  }

  ngOnInit(): void {
    this.focusMonitor.monitor(this.elementRef, true).subscribe(origin => {
      const nowFocused = !!origin;
      if (this.focused && !nowFocused) {
        this.commit();
        this.onTouched();
      }
      if (!this.focused && nowFocused) {
        this.display = this._value === null ? '' : this._value.toFixed(2);
      }
      this.focused = nowFocused;
      this.stateChanges.next();
    });
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      const control = this.ngControl.control;
      const parent = this.parentFormGroup || this.parentForm;
      const submitted = parent ? parent.submitted : false;
      const next = !!control && control.invalid && (control.touched || submitted);
      if (next !== this.errorState) {
        this.errorState = next;
        this.stateChanges.next();
      }
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.inputRef.nativeElement.focus();
    }
  }

  writeValue(value: number | null): void {
    this._value = typeof value === 'number' && !isNaN(value) ? value : null;
    this.display = this.focused ? (this._value === null ? '' : this._value.toFixed(2)) : this.formatDisplay(this._value);
    this.stateChanges.next();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(raw: string): void {
    this.display = raw;
    const parsed = this.parse(raw);
    if (parsed !== this._value) {
      this._value = parsed;
      this.onChange(parsed);
    }
    this.stateChanges.next();
  }

  onKeydown(event: KeyboardEvent): void {
    const allowed = /^[0-9.,\-]$/.test(event.key) || event.key.length > 1 || event.ctrlKey || event.metaKey;
    if (!allowed) {
      event.preventDefault();
    }
    if (event.key === '-' && !this.allowNegative) {
      event.preventDefault();
    }
  }

  /** Normalises the typed text into the stored number and refreshes the formatted display. */
  commit(): void {
    const parsed = this.parse(this.display);
    this._value = parsed;
    this.display = this.formatDisplay(parsed);
    this.onChange(parsed);
  }

  private parse(raw: string): number | null {
    let parsed = this.formatter.parse(raw);
    if (parsed === null) {
      return null;
    }
    if (!this.allowNegative && parsed < 0) {
      parsed = Math.abs(parsed);
    }
    if (this.min !== null && parsed < this.min) {
      parsed = this.min;
    }
    if (this.max !== null && parsed > this.max) {
      parsed = this.max;
    }
    return Math.round(parsed * 100) / 100;
  }

  private formatDisplay(value: number | null): string {
    if (value === null) {
      return '';
    }
    // Symbol is rendered by the prefix element, so the text itself is bare digits.
    return new Intl.NumberFormat(this.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}
