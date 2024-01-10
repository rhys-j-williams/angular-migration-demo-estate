import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

/**
 * Six box one time code input. Standalone, MDC, and the best tested thing in this repository
 * because it was the subject of the KEY-2105 accessibility remediation and the A11y team reviews
 * every change to it. Behaviour contract:
 *
 * - digits only; anything else is dropped, the box does not move
 * - typing advances, Backspace on an empty box moves back and clears the previous one
 * - paste of six or more digits fills from the first box and emits
 * - arrow keys move without changing values
 * - `completed` fires once, when the sixth digit lands, with the full code
 * - it is a ControlValueAccessor so the challenge form can validate it like any other control
 * - each box is its own labelled input so screen readers announce "digit 3 of 6"
 *
 * The single-input-with-letter-spacing design was rejected in KEY-2105 because iOS autofill from
 * SMS did not fire on it. The autocomplete="one-time-code" on the first box is what makes that
 * work; keep it there.
 */
@Component({
  selector: 'ks-otp-input',
  standalone: true,
  imports: [NgFor, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OtpInputComponent), multi: true }],
})
export class OtpInputComponent implements ControlValueAccessor, OnChanges {
  @Input() length = 6;
  @Input() disabled = false;
  @Input() invalid = false;
  @Input() ariaLabel = 'One time code';

  @Output() readonly completed = new EventEmitter<string>();

  @ViewChildren('box') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = Array.from({ length: 6 }, () => '');
  readonly indices: number[] = [0, 1, 2, 3, 4, 5];

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private lastEmitted: string | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('length' in changes) {
      this.digits = Array.from({ length: this.length }, (_, i) => this.digits[i] ?? '');
      this.indices.length = 0;
      for (let i = 0; i < this.length; i++) {
        this.indices.push(i);
      }
    }
  }

  get value(): string {
    return this.digits.join('');
  }

  writeValue(value: string | null): void {
    const clean = (value ?? '').replace(/\D/g, '').slice(0, this.length);
    this.digits = Array.from({ length: this.length }, (_, i) => clean[i] ?? '');
    this.lastEmitted = null;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    if (raw.length === 0) {
      this.digits[index] = '';
      input.value = '';
      this.propagate();
      return;
    }
    if (raw.length > 1) {
      // Mobile keyboards sometimes deliver two characters in one input event.
      this.fillFrom(index, raw);
      return;
    }
    this.digits[index] = raw;
    input.value = raw;
    this.propagate();
    this.focus(index + 1);
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace':
        if (this.digits[index] === '' && index > 0) {
          event.preventDefault();
          this.digits[index - 1] = '';
          this.setBoxValue(index - 1, '');
          this.propagate();
          this.focus(index - 1);
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.focus(index - 1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.focus(index + 1);
        return;
      default:
        if (event.key.length === 1 && !/\d/.test(event.key) && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
        }
    }
  }

  onPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      return;
    }
    this.fillFrom(digits.length >= this.length ? 0 : index, digits);
  }

  onBlur(): void {
    this.onTouched();
  }

  /** Clear and focus the first box; used after a wrong code. */
  reset(): void {
    this.digits = this.digits.map(() => '');
    this.boxes?.forEach((b) => (b.nativeElement.value = ''));
    this.lastEmitted = null;
    this.propagate();
    this.focus(0);
  }

  private fillFrom(start: number, digits: string): void {
    let cursor = start;
    for (const d of digits) {
      if (cursor >= this.length) {
        break;
      }
      this.digits[cursor] = d;
      this.setBoxValue(cursor, d);
      cursor++;
    }
    this.propagate();
    this.focus(Math.min(cursor, this.length - 1));
  }

  private propagate(): void {
    const v = this.value;
    this.onChange(v);
    if (v.length === this.length && v !== this.lastEmitted) {
      this.lastEmitted = v;
      this.completed.emit(v);
    }
    if (v.length < this.length) {
      this.lastEmitted = null;
    }
  }

  private setBoxValue(index: number, value: string): void {
    const box = this.boxes?.get(index)?.nativeElement;
    if (box) {
      box.value = value;
    }
  }

  private focus(index: number): void {
    if (index < 0 || index >= this.length) {
      return;
    }
    const box = this.boxes?.get(index)?.nativeElement;
    if (box) {
      box.focus();
      box.select();
    }
  }
}
