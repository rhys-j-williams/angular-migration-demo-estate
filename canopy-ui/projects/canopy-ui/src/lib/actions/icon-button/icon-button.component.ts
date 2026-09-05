import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

/**
 * Icon only button. `ariaLabel` is mandatory because there is no visible text; the tooltip repeats
 * it for mouse users. `badge` renders a count in the top right (unread messages, pending
 * approvals) through mat-badge.
 *
 *   <cn-icon-button icon="cn:bell" ariaLabel="Notifications" [badge]="unread" (pressed)="open()"></cn-icon-button>
 */
@Component({
  selector: 'cn-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-icon-button' }
})
export class CnIconButtonComponent {
  @Input() icon = 'cn:more';
  @Input() ariaLabel = '';
  @Input() tooltip: string | null = null;
  @Input() color: ThemePalette;
  @Input() disabled = false;
  @Input() badge: number | string | null = null;
  @Input() badgeColor: ThemePalette = 'warn';
  @Input() badgeHidden = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() readonly pressed = new EventEmitter<MouseEvent>();

  get isSvgIcon(): boolean {
    return this.icon.includes(':');
  }

  get tooltipText(): string {
    return this.tooltip ?? this.ariaLabel;
  }

  get showBadge(): boolean {
    return this.badge !== null && this.badge !== 0 && this.badge !== '' && !this.badgeHidden;
  }

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    this.pressed.emit(event);
  }
}
