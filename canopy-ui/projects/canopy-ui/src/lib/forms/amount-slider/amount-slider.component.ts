import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { CN_CONFIG, CnConfig, CnCurrencyFormatService } from '@meridian/canopy-ui/core';

/**
 * Slider for picking an amount inside a range: loan amount, payment amount, savings goal. Shows
 * the value as currency in the thumb label and the min/max under the track. Pairs well with a
 * cn-currency-input bound to the same control for people who prefer to type.
 *
 *   <cn-amount-slider formControlName="amount" [min]="500" [max]="25000" [step]="100"></cn-amount-slider>
 */
@Component({
  selector: 'cn-amount-slider',
  templateUrl: './amount-slider.component.html',
  styleUrls: ['./amount-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnAmountSliderComponent), multi: true }],
  host: { class: 'cn-amount-slider' }
})
export class CnAmountSliderComponent implements ControlValueAccessor {
  @Input() label = 'Amount';
  @Input() min = 0;
  @Input() max = 10000;
  @Input() step = 50;
  @Input() currency: string;
  /** Tick spacing in steps, or 'auto' to let Material choose. */
  @Input() tickInterval: number | 'auto' = 'auto';

  @Output() readonly valueChange = new EventEmitter<number>();

  value = 0;
  disabled = false;

  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private readonly formatter: CnCurrencyFormatService, @Inject(CN_CONFIG) config: CnConfig) {
    this.currency = config.currency;
  }

  formatLabel = (value: number): string => {
    if (value >= 1000) {
      return `${this.formatter.symbol(this.currency)}${Math.round(value / 100) / 10}k`;
    }
    return this.formatter.format(value, this.currency).replace(/\.00$/, '');
  };

  format(value: number): string {
    return this.formatter.format(value, this.currency);
  }

  writeValue(value: number | null): void {
    this.value = typeof value === 'number' ? value : this.min;
  }

  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: MatSliderChange): void {
    this.value = event.value ?? this.min;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
