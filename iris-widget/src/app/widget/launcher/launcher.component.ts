import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/** The round bubble. Design token sheet calls it "the pill"; nobody else does. */
@Component({
  selector: 'iris-launcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="iris-launcher"
      [class.iris-launcher--open]="open"
      [attr.aria-expanded]="open"
      aria-controls="iris-panel"
      [attr.aria-label]="open ? 'Close Iris assistant' : 'Chat with Iris, our virtual assistant'"
      (click)="pressed.emit()">
      <mat-icon class="iris-launcher__icon" [svgIcon]="open ? 'cn:close' : 'cn:help'" aria-hidden="true"></mat-icon>
      <span class="iris-launcher__label" *ngIf="!open">Need help?</span>
    </button>
  `,
  styles: [
    `
      .iris-launcher {
        display: inline-flex;
        align-items: center;
        gap: var(--cn-space-2);
        min-height: 48px;
        padding: 0 var(--cn-space-4);
        border: 0;
        border-radius: 24px;
        background: var(--cn-color-primary);
        color: var(--cn-color-primary-contrast);
        box-shadow: var(--cn-shadow-2);
        cursor: pointer;
      }
      .iris-launcher:focus-visible {
        outline: var(--cn-focus-ring);
        outline-offset: 2px;
      }
      .iris-launcher--open {
        width: 48px;
        padding: 0;
        justify-content: center;
        border-radius: 50%;
      }
      .iris-launcher__icon {
        width: 24px;
        height: 24px;
      }
      .iris-launcher__label {
        font-weight: 600;
      }
    `,
  ],
})
export class LauncherComponent {
  @Input() open = false;
  @Output() pressed = new EventEmitter<void>();
}
