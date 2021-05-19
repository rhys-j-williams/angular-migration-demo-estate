import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

/**
 * Single collapsible section. Wraps mat-expansion-panel so the disclosure semantics and animation
 * come from Material; adds a right aligned summary slot (e.g. a total) that stays visible when
 * collapsed. Group several inside a `mat-accordion` if you want exclusive opening.
 *
 *   <cn-expansion title="Pending transactions" [summary]="pendingTotal | cnCurrency">...</cn-expansion>
 */
@Component({
  selector: 'cn-expansion',
  templateUrl: './expansion.component.html',
  styleUrls: ['./expansion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-expansion' }
})
export class CnExpansionComponent {
  @Input() title = '';
  @Input() description: string | null = null;
  @Input() summary: string | null = null;
  @Input() expanded = false;
  @Input() disabled = false;
  @Input() icon: string | null = null;

  @Output() readonly expandedChange = new EventEmitter<boolean>();

  get isSvgIcon(): boolean {
    return !!this.icon && this.icon.includes(':');
  }

  onOpened(): void {
    this.expanded = true;
    this.expandedChange.emit(true);
  }

  onClosed(): void {
    this.expanded = false;
    this.expandedChange.emit(false);
  }
}
