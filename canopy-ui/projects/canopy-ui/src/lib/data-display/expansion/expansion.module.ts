import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CnExpansionComponent } from './expansion.component';

@NgModule({
  imports: [CommonModule, MatExpansionModule, MatIconModule],
  declarations: [CnExpansionComponent],
  exports: [CnExpansionComponent, MatExpansionModule]
})
export class CnExpansionModule {}
