import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CnTabDirective } from './tab.directive';
import { CnTabsComponent } from './tabs.component';

@NgModule({
  imports: [CommonModule, MatTabsModule, MatIconModule],
  declarations: [CnTabsComponent, CnTabDirective],
  exports: [CnTabsComponent, CnTabDirective]
})
export class CnTabsModule {}
