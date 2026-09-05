import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CnMaskPreset = 'phone-us' | 'ssn-last4' | 'zip' | 'account-number' | 'routing-number' | 'sort-code' | 'custom';

const PRESETS: Record<Exclude<CnMaskPreset, 'custom'>, string> = {
  'phone-us': '(000) 000-0000',
  'ssn-last4': '0000',
  zip: '00000',
  'account-number': '0000000000000000',
  'routing-number': '000000000',
  'sort-code': '00-00-00'
};

/**
 * Text input with a fixed character mask, built on ngx-mask. Presets cover the formats the bank
 * actually collects; anything else passes `preset="custom"` and a `mask` expression.
 *
 *   <cn-masked-input formControlName="phone" preset="phone-us" label="Mobile number"></cn-masked-input>
 *
 * The control value is the unmasked digits. Do not use this for card PANs; those go through the
 * tokenised iframe field owned by Keystone.
 */
@Component({
  selector: 'cn-masked-input',
  templateUrl: './masked-input.component.html',
  styleUrls: ['./masked-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnMaskedInputComponent), multi: true }],
  host: { class: 'cn-masked-input' }
})
export class CnMaskedInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint: string | null = null;
  @Input() placeholder = '';
  @Input() preset: CnMaskPreset = 'custom';
  @Input() mask = '';
  @Input() required = false;
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() errorText: string | null = null;

  value = '';
  disabled = false;
  touched = false;

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get activeMask(): string {
    return this.preset === 'custom' ? this.mask : PRESETS[this.preset];
  }

  get inputMode(): string {
    return /^[0-9() -]*$/.test(this.activeMask) ? 'numeric' : 'text';
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }
}
