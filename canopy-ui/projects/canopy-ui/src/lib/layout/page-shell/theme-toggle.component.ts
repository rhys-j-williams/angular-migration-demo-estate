import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CnThemeName, CnThemeService } from '@meridian/canopy-ui/core';

/** Top bar theme picker. Persists through CnThemeService. */
@Component({
  selector: 'cn-theme-toggle',
  template: `
    <button mat-icon-button type="button" [matMenuTriggerFor]="menu" aria-label="Choose theme">
      <mat-icon svgIcon="cn:settings" aria-hidden="true"></mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item *ngFor="let t of themes" (click)="set(t.value)" [attr.aria-checked]="(theme$ | async) === t.value" role="menuitemradio">
        <mat-icon *ngIf="(theme$ | async) === t.value" svgIcon="cn:check" aria-hidden="true"></mat-icon>
        <span>{{ t.label }}</span>
      </button>
    </mat-menu>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CnThemeToggleComponent {
  readonly themes: { value: CnThemeName; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'high-contrast', label: 'High contrast' }
  ];
  readonly theme$ = this.themeService.theme$;

  constructor(private readonly themeService: CnThemeService) {}

  set(theme: CnThemeName): void {
    this.themeService.setTheme(theme);
  }
}
