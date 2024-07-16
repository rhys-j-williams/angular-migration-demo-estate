import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation } from '@angular/core';

export interface CnListItem<T = unknown> {
  id: string;
  primary: string;
  secondary?: string;
  meta?: string;
  icon?: string;
  disabled?: boolean;
  data?: T;
}

/**
 * Short, non-virtualised list of items with primary/secondary text and a trailing meta column
 * (amount, date). Use for recent transactions on a dashboard, payees, alerts. Over ~100 items use
 * cn-virtual-list.
 *
 *   <cn-list [items]="recent" interactive (itemSelect)="open($event)"></cn-list>
 */
@Component({
  selector: 'cn-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-list', '[class.cn-list--dense]': 'dense' }
})
export class CnListComponent<T = unknown> {
  @Input() items: CnListItem<T>[] = [];
  @Input() interactive = false;
  @Input() dense = false;
  @Input() dividers = true;
  @Input() ariaLabel: string | null = null;
  @Input() emptyText = 'Nothing here yet';
  @Input() metaTemplate: TemplateRef<{ $implicit: CnListItem<T> }> | null = null;

  @Output() readonly itemSelect = new EventEmitter<CnListItem<T>>();

  isSvgIcon(icon: string | undefined): boolean {
    return !!icon && icon.includes(':');
  }

  select(item: CnListItem<T>): void {
    if (this.interactive && !item.disabled) {
      this.itemSelect.emit(item);
    }
  }

  trackById(_: number, item: CnListItem<T>): string {
    return item.id;
  }
}
