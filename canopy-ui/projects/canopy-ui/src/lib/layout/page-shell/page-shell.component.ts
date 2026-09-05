import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

export interface CnNavItem {
  id: string;
  label: string;
  icon?: string;
  link?: string | unknown[];
  badge?: number | string | null;
  children?: CnNavItem[];
  disabled?: boolean;
}

/**
 * Application frame: top bar, left navigation, main content region, skip link. The consumer app
 * puts this in its root component and routes render inside it.
 *
 *   <cn-page-shell appName="Meridian Online" [nav]="navItems" [userName]="user.displayName">
 *     <ng-container cnShellToolbar>...</ng-container>
 *     <router-outlet></router-outlet>
 *   </cn-page-shell>
 *
 * Nav collapses to a drawer under 960px. Theme switcher lives in the top bar when
 * `showThemeToggle` is set (CnThemeService does the work).
 */
@Component({
  selector: 'cn-page-shell',
  templateUrl: './page-shell.component.html',
  styleUrls: ['./page-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-page-shell', '[class.cn-page-shell--nav-collapsed]': 'navCollapsed' }
})
export class CnPageShellComponent {
  @Input() appName = '';
  @Input() environmentLabel: string | null = null;
  @Input() nav: CnNavItem[] = [];
  @Input() userName: string | null = null;
  @Input() showThemeToggle = false;
  @Input() navCollapsed = false;
  @Input() maxContentWidth = '1280px';

  @Output() readonly navSelect = new EventEmitter<CnNavItem>();
  @Output() readonly signOut = new EventEmitter<void>();

  drawerOpen = false;

  isSvgIcon(icon: string | undefined): boolean {
    return !!icon && icon.includes(':');
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  toggleCollapsed(): void {
    this.navCollapsed = !this.navCollapsed;
  }

  onNav(item: CnNavItem): void {
    if (item.disabled) {
      return;
    }
    this.drawerOpen = false;
    this.navSelect.emit(item);
  }
}
