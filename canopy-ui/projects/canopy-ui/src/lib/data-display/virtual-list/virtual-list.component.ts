import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, Output, TemplateRef, TrackByFunction, ViewChild, ViewEncapsulation
} from '@angular/core';

export interface CnVirtualListContext<T> {
  $implicit: T;
  index: number;
  active: boolean;
}

/**
 * Virtualised list for long, uniform-height collections: full transaction history, audit trails,
 * the payee book. Renders only what is on screen through CdkVirtualScrollViewport and supplies
 * roving arrow-key navigation over the rendered rows.
 *
 *   <cn-virtual-list [items]="transactions" [itemHeight]="56" [trackBy]="byId" (activate)="open($event)">
 *     <ng-template cnVirtualItem let-txn let-active="active">...</ng-template>
 *   </cn-virtual-list>
 *
 * `reachedEnd` fires when the last row scrolls into view so consumers can fetch the next page.
 * Item height must be fixed; variable height rows are not supported (CNPY-1402 won't fix).
 */
@Component({
  selector: 'cn-virtual-list',
  templateUrl: './virtual-list.component.html',
  styleUrls: ['./virtual-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-virtual-list' }
})
export class CnVirtualListComponent<T = unknown> {
  @Input() items: T[] = [];
  @Input() itemHeight = 56;
  @Input() height = '480px';
  @Input() trackBy: TrackByFunction<T> = (index: number) => index;
  @Input() ariaLabel = 'List';
  @Input() emptyText = 'No items';
  @Input() endThreshold = 5;

  @Output() readonly activate = new EventEmitter<T>();
  @Output() readonly reachedEnd = new EventEmitter<void>();

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<CnVirtualListContext<T>> | null = null;

  activeIndex = -1;
  private endEmittedFor = -1;

  onScrolledIndexChange(first: number): void {
    if (!this.viewport) {
      return;
    }
    const range = this.viewport.getRenderedRange();
    if (range.end >= this.items.length - this.endThreshold && this.endEmittedFor !== this.items.length) {
      this.endEmittedFor = this.items.length;
      this.reachedEnd.emit();
    }
    if (this.activeIndex < first || this.activeIndex >= range.end) {
      // Active row scrolled away; leave it, keyboard nav will bring it back into view.
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.items.length) {
      return;
    }
    let next = this.activeIndex;
    switch (event.key) {
      case 'ArrowDown': next = Math.min(this.items.length - 1, this.activeIndex + 1); break;
      case 'ArrowUp': next = Math.max(0, this.activeIndex - 1); break;
      case 'Home': next = 0; break;
      case 'End': next = this.items.length - 1; break;
      case 'PageDown': next = Math.min(this.items.length - 1, this.activeIndex + this.pageSize()); break;
      case 'PageUp': next = Math.max(0, this.activeIndex - this.pageSize()); break;
      case 'Enter':
      case ' ':
        if (this.activeIndex >= 0) {
          event.preventDefault();
          this.activate.emit(this.items[this.activeIndex]);
        }
        return;
      default: return;
    }
    event.preventDefault();
    this.setActive(next);
  }

  setActive(index: number): void {
    this.activeIndex = index;
    this.viewport?.scrollToIndex(Math.max(0, index - Math.floor(this.pageSize() / 2)), 'auto');
  }

  onItemClick(index: number): void {
    this.activeIndex = index;
    this.activate.emit(this.items[index]);
  }

  scrollToTop(): void {
    this.viewport?.scrollToIndex(0);
  }

  private pageSize(): number {
    return Math.max(1, Math.floor((this.viewport?.getViewportSize() ?? 480) / this.itemHeight) - 1);
  }
}
