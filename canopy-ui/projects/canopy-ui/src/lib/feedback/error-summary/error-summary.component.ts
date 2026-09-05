import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

export interface CnErrorSummaryItem {
  /** DOM id of the field, used for the anchor href and focus target. */
  fieldId: string;
  message: string;
}

export type CnErrorMessageMap = Record<string, Record<string, string> | string>;

/**
 * GOV.UK-style error summary shown at the top of a form after a failed submit: a heading, a list
 * of links to each invalid field. Announced as an alert and focused when it appears so screen
 * reader users hear what went wrong (WCAG 3.3.1, audit finding A11Y-0412).
 *
 * Either pass `items` directly, or a `form` plus a `messages` map keyed by control name then error
 * key; unknown errors fall back to "Check this field".
 *
 *   <cn-error-summary *ngIf="submitted && form.invalid" [form]="form" [messages]="messages"></cn-error-summary>
 */
@Component({
  selector: 'cn-error-summary',
  templateUrl: './error-summary.component.html',
  styleUrls: ['./error-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-error-summary', role: 'alert', tabindex: '-1', 'aria-labelledby': 'cn-error-summary-title' }
})
export class CnErrorSummaryComponent implements OnChanges, AfterViewChecked {
  @Input() title = 'There is a problem';
  @Input() items: CnErrorSummaryItem[] = [];
  @Input() form: FormGroup | null = null;
  @Input() messages: CnErrorMessageMap = {};
  @Input() idPrefix = '';
  @Input() autoFocus = true;

  private needsFocus = false;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  get resolvedItems(): CnErrorSummaryItem[] {
    if (this.items.length || !this.form) {
      return this.items;
    }
    return Object.entries(this.form.controls)
      .filter(([, control]) => control.invalid)
      .map(([name, control]) => ({ fieldId: `${this.idPrefix}${name}`, message: this.messageFor(name, control) }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.autoFocus && (changes['items'] || changes['form'])) {
      this.needsFocus = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsFocus && this.resolvedItems.length) {
      this.needsFocus = false;
      this.host.nativeElement.focus({ preventScroll: false });
    }
  }

  focusField(event: Event, item: CnErrorSummaryItem): void {
    const target = document.getElementById(item.fieldId);
    if (target) {
      event.preventDefault();
      const focusable = target.matches('input,select,textarea,button,[tabindex]')
        ? target
        : (target.querySelector('input,select,textarea,button,[tabindex]') as HTMLElement | null);
      (focusable ?? target).focus();
      target.scrollIntoView({ block: 'center' });
    }
  }

  private messageFor(name: string, control: AbstractControl): string {
    const entry = this.messages[name];
    if (typeof entry === 'string') {
      return entry;
    }
    const errorKey = Object.keys(control.errors ?? {})[0];
    return (entry && errorKey && entry[errorKey]) || 'Check this field';
  }
}
