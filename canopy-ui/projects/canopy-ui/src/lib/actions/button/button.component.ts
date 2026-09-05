import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

export type CnButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type CnButtonSize = 'default' | 'small';

/**
 * The bank's button. Four variants map onto the Material button flavours so we get the ripple,
 * focus handling and disabled semantics for free, while the palette and spacing come from tokens.
 *
 *   <cn-button variant="primary" icon="cn:transfer" (pressed)="submit()">Make transfer</cn-button>
 *
 * Use `type="submit"` inside forms. `loading` disables the button and shows a spinner in place of
 * the icon; the label stays so the width does not jump (CNPY-903).
 */
@Component({
  selector: 'cn-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cn-button',
    '[class.cn-button--small]': 'size === "small"',
    '[class.cn-button--block]': 'block',
    '[class.cn-button--loading]': 'loading'
  }
})
export class CnButtonComponent {
  @Input() variant: CnButtonVariant = 'secondary';
  @Input() size: CnButtonSize = 'default';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  /** Icon in the sprite, e.g. `cn:transfer`, or a ligature name from the Material font. */
  @Input() icon: string | null = null;
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  @Input() ariaLabel: string | null = null;

  @Output() readonly pressed = new EventEmitter<MouseEvent>();

  get color(): ThemePalette {
    switch (this.variant) {
      case 'primary': return 'primary';
      case 'destructive': return 'warn';
      default: return undefined;
    }
  }

  get isFlat(): boolean {
    return this.variant === 'primary' || this.variant === 'destructive';
  }

  get isStroked(): boolean {
    return this.variant === 'secondary';
  }

  get isSvgIcon(): boolean {
    return !!this.icon && this.icon.includes(':');
  }

  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.pressed.emit(event);
  }
}
