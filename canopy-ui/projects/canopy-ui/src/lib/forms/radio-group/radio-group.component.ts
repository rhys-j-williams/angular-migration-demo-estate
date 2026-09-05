import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

export interface CnRadioOption<T = unknown> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

let nextId = 0;

/**
 * Radio group rendered from an option array. `legend` is rendered as a real <legend> inside a
 * fieldset so the group is announced properly. Vertical by default; `inline` for two or three short
 * options.
 *
 *   <cn-radio-group legend="Transfer speed" [options]="speeds" formControlName="speed"></cn-radio-group>
 */
@Component({
  selector: 'cn-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnRadioGroupComponent), multi: true }],
  host: { class: 'cn-radio-group', '[class.cn-radio-group--inline]': 'inline' }
})
export class CnRadioGroupComponent<T = unknown> implements ControlValueAccessor {
  @Input() legend = '';
  @Input() options: CnRadioOption<T>[] = [];
  @Input() inline = false;
  @Input() required = false;
  @Input() errorText: string | null = null;

  @Output() readonly changed = new EventEmitter<T>();

  readonly name = `cn-radio-group-${nextId++}`;
  value: T | null = null;
  disabled = false;

  private onChange: (v: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: T | null): void {
    this.value = value;
  }

  registerOnChange(fn: (v: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onMatChange(event: MatRadioChange): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
    this.changed.emit(event.value);
  }
}
