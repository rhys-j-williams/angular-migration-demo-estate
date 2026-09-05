import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CnFilterChipsComponent } from './filter-chips.component';

@NgModule({
  imports: [CommonModule, MatChipsModule, MatIconModule, MatButtonModule],
  declarations: [CnFilterChipsComponent],
  exports: [CnFilterChipsComponent]
})
export class CnFilterChipsModule {}
