import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { CnA11yModule } from '@meridian/canopy-ui/a11y';
import { CnTooltipModule } from '@meridian/canopy-ui/overlays';
import { CnPageShellComponent } from './page-shell.component';
import { CnThemeToggleComponent } from './theme-toggle.component';

@NgModule({
  imports: [CommonModule, RouterModule, FlexLayoutModule, MatButtonModule, MatIconModule, MatMenuModule, CnA11yModule, CnTooltipModule],
  declarations: [CnPageShellComponent, CnThemeToggleComponent],
  exports: [CnPageShellComponent, CnThemeToggleComponent]
})
export class CnPageShellModule {}
