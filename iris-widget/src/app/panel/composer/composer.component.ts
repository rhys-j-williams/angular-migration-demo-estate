import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/** Text box plus send. Enter sends, Shift+Enter is a newline. 500 chars, matching the orchestrator DTO. */
@Component({
  selector: 'iris-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="iris-composer" (ngSubmit)="submit()">
      <label class="iris-composer__label" for="iris-composer-input">Message Iris</label>
      <textarea
        id="iris-composer-input"
        class="iris-composer__input"
        name="text"
        rows="1"
        [maxlength]="maxLength"
        [disabled]="disabled"
        [(ngModel)]="draft"
        (keydown.enter)="onEnter($event)"
        placeholder="Type your question"
        autocomplete="off"></textarea>
      <cn-icon-button icon="cn:arrow-up" ariaLabel="Send" type="submit" color="primary" [disabled]="disabled || !draft.trim()"></cn-icon-button>
    </form>
    <p class="iris-composer__count" *ngIf="draft.length > maxLength - 60" aria-live="polite">{{ maxLength - draft.length }} characters left</p>
  `,
  styles: [
    `
      .iris-composer {
        display: flex;
        align-items: flex-end;
        gap: var(--cn-space-2);
      }
      .iris-composer__label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
      .iris-composer__input {
        flex: 1;
        min-height: 40px;
        max-height: 120px;
        padding: 10px 12px;
        border: 1px solid var(--cn-color-border-strong);
        border-radius: var(--cn-radius-md);
        font: inherit;
        resize: none;
      }
      .iris-composer__input:focus-visible {
        outline: var(--cn-focus-ring);
      }
      .iris-composer__count {
        margin: 4px 0 0;
        font-size: 11px;
        color: var(--cn-color-text-muted);
        text-align: right;
      }
    `,
  ],
})
export class ComposerComponent {
  @Input() disabled = false;
  @Output() submitted = new EventEmitter<string>();

  readonly maxLength = 500;
  draft = '';

  onEnter(event: Event): void {
    const key = event as KeyboardEvent;
    if (key.shiftKey) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    const text = this.draft.trim();
    if (!text || this.disabled) {
      return;
    }
    this.submitted.emit(text);
    this.draft = '';
  }
}
