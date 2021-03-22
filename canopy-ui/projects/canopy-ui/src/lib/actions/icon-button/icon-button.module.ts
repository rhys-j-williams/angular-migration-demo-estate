import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CnIconButtonComponent } from './icon-button.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  declarations: [CnIconButtonComponent],
  exports: [CnIconButtonComponent]
})
export class CnIconButtonModule {}
