import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

export interface CnMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  /** Renders a divider above this item. */
  dividerBefore?: boolean;
  /** Destructive items render in the warn colour and sit at the bottom by convention. */
  destructive?: boolean;
}

/**
 * Overflow / action menu driven by a config array rather than projected content, so the same menu
 * can be built from an entitlements response.
 *
 *   <cn-menu [items]="actions" triggerLabel="Account actions" (selected)="onAction($event)"></cn-menu>
 */
@Component({
  selector: 'cn-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-menu' }
})
export class CnMenuComponent {
  @Input() items: CnMenuItem[] = [];
  @Input() triggerLabel = 'More actions';
  @Input() triggerIcon = 'cn:more';
  @Input() disabled = false;
  @Input() xPosition: 'before' | 'after' = 'before';

  @Output() readonly selected = new EventEmitter<CnMenuItem>();
  @Output() readonly opened = new EventEmitter<void>();
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;

  isSvgIcon(icon: string | undefined): boolean {
    return !!icon && icon.includes(':');
  }

  select(item: CnMenuItem): void {
    if (item.disabled) {
      return;
    }
    this.selected.emit(item);
  }

  open(): void {
    this.trigger?.openMenu();
  }

  close(): void {
    this.trigger?.closeMenu();
  }
}
