import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

/**
 * Checkbox with an optional second line of help text. Wraps mat-checkbox so the label association
 * and keyboard handling come from Material; the `indeterminate` state is for "select all" headers
 * in cn-data-table.
 *
 *   <cn-checkbox formControlName="acceptTerms" hint="Required to continue">I have read the terms</cn-checkbox>
 */
@Component({
  selector: 'cn-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnCheckboxComponent), multi: true }],
  host: { class: 'cn-checkbox' }
})
export class CnCheckboxComponent implements ControlValueAccessor {
  @Input() hint: string | null = null;
  @Input() indeterminate = false;
  @Input() required = false;
  @Input() ariaLabel: string | null = null;
  @Input() labelPosition: 'before' | 'after' = 'after';

  @Output() readonly changed = new EventEmitter<boolean>();

  checked = false;
  disabled = false;

  private onChange: (v: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onMatChange(event: MatCheckboxChange): void {
    this.checked = event.checked;
    this.indeterminate = false;
    this.onChange(this.checked);
    this.onTouched();
    this.changed.emit(this.checked);
  }
}
