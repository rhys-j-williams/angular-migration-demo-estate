import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

/**
 * On/off switch for settings that apply immediately (paperless statements, card lock, alerts).
 * For choices that need a Save button use cn-checkbox instead; that distinction is in the design
 * guidelines and reviewers will push back.
 *
 *   <cn-toggle formControlName="cardLocked" onText="Locked" offText="Active">Lock card</cn-toggle>
 */
@Component({
  selector: 'cn-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnToggleComponent), multi: true }],
  host: { class: 'cn-toggle', '[class.cn-toggle--on]': 'checked' }
})
export class CnToggleComponent implements ControlValueAccessor {
  @Input() hint: string | null = null;
  @Input() onText: string | null = null;
  @Input() offText: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() labelPosition: 'before' | 'after' = 'before';

  @Output() readonly changed = new EventEmitter<boolean>();

  checked = false;
  disabled = false;

  private onChange: (v: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get stateText(): string | null {
    return this.checked ? this.onText : this.offText;
  }

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

  onMatChange(event: MatSlideToggleChange): void {
    this.checked = event.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.changed.emit(this.checked);
  }
}
