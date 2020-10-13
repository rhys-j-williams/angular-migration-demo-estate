import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

/** Focuses the host after view init. Used on the first field of each wizard step. */
@Directive({ selector: '[molAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  @Input() molAutofocus: boolean | '' = true;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (this.molAutofocus === false) {
      return;
    }
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
