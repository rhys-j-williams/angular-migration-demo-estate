import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

export interface CnAutocompleteOption<T = unknown> {
  value: T;
  label: string;
  description?: string;
}

export type CnAutocompleteSource<T> = (query: string) => Observable<CnAutocompleteOption<T>[]>;

/**
 * Typeahead over a remote or local source. The consumer supplies a `source` function returning an
 * observable of options; the component debounces, cancels stale requests and announces the result
 * count for screen readers.
 *
 *   <cn-autocomplete label="Payee" [source]="searchPayees" formControlName="payee"></cn-autocomplete>
 *
 * The control value is the selected option's `value`, or null while the text does not match.
 */
@Component({
  selector: 'cn-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CnAutocompleteComponent), multi: true }],
  host: { class: 'cn-autocomplete' }
})
export class CnAutocompleteComponent<T = unknown> implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint: string | null = null;
  @Input() minLength = 2;
  @Input() debounce = 250;
  @Input() required = false;
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() noResultsText = 'No matches';
  @Input() source: CnAutocompleteSource<T> = () => of([]);

  @Output() readonly optionSelected = new EventEmitter<CnAutocompleteOption<T>>();

  readonly query = new FormControl<string>('', { nonNullable: true });
  options: CnAutocompleteOption<T>[] = [];
  searching = false;
  searched = false;
  disabled = false;

  private readonly destroy$ = new Subject<void>();
  private selected: CnAutocompleteOption<T> | null = null;
  private onChange: (v: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(
        debounceTime(this.debounce),
        distinctUntilChanged(),
        switchMap(text => {
          if (this.selected && text === this.selected.label) {
            return of(null);
          }
          if (this.selected) {
            this.selected = null;
            this.onChange(null);
          }
          if (!text || text.length < this.minLength) {
            this.searched = false;
            return of([] as CnAutocompleteOption<T>[]);
          }
          this.searching = true;
          return this.source(text).pipe(catchError(() => of([] as CnAutocompleteOption<T>[])));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.searching = false;
        if (result !== null) {
          this.options = result;
          this.searched = this.query.value.length >= this.minLength;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  displayWith = (option: CnAutocompleteOption<T> | string | null): string =>
    typeof option === 'string' ? option : option?.label ?? '';

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const option = event.option.value as CnAutocompleteOption<T>;
    this.selected = option;
    this.query.setValue(option.label, { emitEvent: false });
    this.onChange(option.value);
    this.optionSelected.emit(option);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: T | null): void {
    if (value === null || value === undefined) {
      this.selected = null;
      this.query.setValue('', { emitEvent: false });
      return;
    }
    const match = this.options.find(o => o.value === value);
    this.selected = match ?? { value, label: String(value) };
    this.query.setValue(this.selected.label, { emitEvent: false });
  }

  registerOnChange(fn: (v: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.query.disable({ emitEvent: false });
    } else {
      this.query.enable({ emitEvent: false });
    }
  }
}
