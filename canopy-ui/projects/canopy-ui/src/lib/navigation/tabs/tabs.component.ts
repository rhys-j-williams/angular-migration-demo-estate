import { ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, Output, QueryList, ViewEncapsulation, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CnTabDirective } from './tab.directive';

/**
 * Tab strip with lazy tab bodies. Tabs are declared with the `cnTab` template directive:
 *
 *   <cn-tabs (selectedChange)="track($event)">
 *     <ng-template cnTab label="Activity" [badge]="pendingCount">...</ng-template>
 *     <ng-template cnTab label="Statements">...</ng-template>
 *   </cn-tabs>
 *
 * Bodies render only when first selected, which is why the templates are lazy; heavy tables
 * behind a tab do not cost anything until the customer opens them.
 */
@Component({
  selector: 'cn-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-tabs', '[class.cn-tabs--stretch]': 'stretch' }
})
export class CnTabsComponent implements AfterContentChecked {
  @Input() selectedIndex = 0;
  @Input() stretch = false;
  @Input() ariaLabel = 'Sections';

  @Output() readonly selectedChange = new EventEmitter<number>();

  @ContentChildren(CnTabDirective) tabs?: QueryList<CnTabDirective>;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  // Tab labels/badges are inputs on projected directives, which do not dirty an OnPush host.
  ngAfterContentChecked(): void {
    this.cdr.markForCheck();
  }

  onChange(event: MatTabChangeEvent): void {
    this.selectedIndex = event.index;
    this.selectedChange.emit(event.index);
  }
}
