import { Component, EventEmitter, forwardRef, Input, Output, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

export interface CnSelectOption<T = unknown> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Single or multi select over a flat option list. Options can carry a `description` (shown as a
 * second line, e.g. account number under the account name) and a `group` for optgroup style
 * headers.
 *
 *   <cn-select label="From account" [options]="accounts" formControlName="fromAccountId"></cn-select>
 *
 * The panel gets the `cn-select-panel` class so the styles in select.component.scss can reach the
 * options rendered in the overlay.
 */
@Component({
  selector: 'cn-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnSelectComponent), multi: true }],
  host: { class: 'cn-select' }
})
export class CnSelectComponent<T = unknown> implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint: string | null = null;
  @Input() placeholder = '';
  @Input() options: CnSelectOption<T>[] = [];
  @Input() multiple = false;
  @Input() required = false;
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() errorText: string | null = null;
  @Input() compareWith: (a: T, b: T) => boolean = (a, b) => a === b;
  @Input() optionTemplate: TemplateRef<{ $implicit: CnSelectOption<T> }> | null = null;

  @Output() readonly selectionChange = new EventEmitter<T | T[] | null>();

  value: T | T[] | null = null;
  disabled = false;

  private onChange: (v: T | T[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private groupsSource: CnSelectOption<T>[] | null = null;
  private groupsCache: { name: string | null; options: CnSelectOption<T>[] }[] = [];

  // Memoised on the options reference: a fresh array per check makes ngFor tear the optgroups down every cycle.
  get groups(): { name: string | null; options: CnSelectOption<T>[] }[] {
    if (this.groupsSource !== this.options) {
      const map = new Map<string | null, CnSelectOption<T>[]>();
      for (const option of this.options) {
        const key = option.group ?? null;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(option);
      }
      this.groupsCache = Array.from(map.entries()).map(([name, options]) => ({ name, options }));
      this.groupsSource = this.options;
    }
    return this.groupsCache;
  }

  get hasGroups(): boolean {
    return this.options.some(o => !!o.group);
  }

  writeValue(value: T | T[] | null): void {
    this.value = value;
  }

  registerOnChange(fn: (v: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: MatSelectChange): void {
    this.value = event.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
