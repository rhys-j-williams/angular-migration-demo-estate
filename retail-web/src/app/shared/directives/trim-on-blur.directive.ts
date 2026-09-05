import { Directive, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Trims whitespace on blur. Payee names with trailing spaces failed BFF validation (MOL-2233). */
@Directive({ selector: 'input[molTrimOnBlur]' })
export class TrimOnBlurDirective {
  constructor(@Optional() private readonly control: NgControl | null) {}

  @HostListener('blur')
  onBlur(): void {
    const value = this.control?.value;
    if (typeof value === 'string' && value !== value.trim()) {
      this.control?.control?.setValue(value.trim());
    }
  }
}
