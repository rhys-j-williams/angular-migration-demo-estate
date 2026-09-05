import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatChipList, MatChipSelectionChange } from '@angular/material/chips';

export interface CnFilterChip<T = string> {
  value: T;
  label: string;
  count?: number;
  icon?: string;
  disabled?: boolean;
}

/**
 * Row of selectable filter chips used above tables and lists: transaction type, account, status.
 * Single or multi select; the control value is the selected value(s). A "Clear" chip appears when
 * anything is selected.
 *
 *   <cn-filter-chips [chips]="typeChips" multiple formControlName="types" (selectionChange)="reload()"></cn-filter-chips>
 */
@Component({
  selector: 'cn-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnFilterChipsComponent), multi: true }],
  host: { class: 'cn-filter-chips' }
})
export class CnFilterChipsComponent<T = string> implements ControlValueAccessor {
  @Input() chips: CnFilterChip<T>[] = [];
  @Input() multiple = false;
  @Input() ariaLabel = 'Filters';
  @Input() showClear = true;
  @Input() showCounts = true;

  @Output() readonly selectionChange = new EventEmitter<T[]>();

  @ViewChild(MatChipList) chipList?: MatChipList;

  selected: T[] = [];
  disabled = false;

  private onChange: (v: T[] | T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  isSelected(chip: CnFilterChip<T>): boolean {
    return this.selected.includes(chip.value);
  }

  isSvgIcon(icon: string | undefined): boolean {
    return !!icon && icon.includes(':');
  }

  /** Pointer toggle; MatChip only toggles itself from the keyboard. */
  toggle(chip: CnFilterChip<T>): void {
    if (this.disabled || chip.disabled) {
      return;
    }
    this.apply(chip, !this.isSelected(chip));
  }

  onChipSelection(event: MatChipSelectionChange, chip: CnFilterChip<T>): void {
    if (event.isUserInput) {
      this.apply(chip, event.selected);
    }
  }

  private apply(chip: CnFilterChip<T>, selected: boolean): void {
    if (selected) {
      this.selected = this.multiple ? [...this.selected.filter(v => v !== chip.value), chip.value] : [chip.value];
    } else {
      this.selected = this.selected.filter(v => v !== chip.value);
    }
    this.emit();
  }

  clear(): void {
    this.selected = [];
    this.emit();
  }

  writeValue(value: T[] | T | null): void {
    this.selected = value === null || value === undefined ? [] : Array.isArray(value) ? [...value] : [value];
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: T[] | T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private emit(): void {
    this.onChange(this.multiple ? this.selected : this.selected[0] ?? null);
    this.onTouched();
    this.selectionChange.emit(this.selected);
  }
}
