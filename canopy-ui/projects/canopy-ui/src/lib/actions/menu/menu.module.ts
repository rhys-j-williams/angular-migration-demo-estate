import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CnMenuComponent } from './menu.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  declarations: [CnMenuComponent],
  exports: [CnMenuComponent, MatMenuModule]
})
export class CnMenuModule {}
