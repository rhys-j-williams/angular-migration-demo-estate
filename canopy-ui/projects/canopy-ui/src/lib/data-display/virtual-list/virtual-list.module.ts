import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CnVirtualListComponent } from './virtual-list.component';

@NgModule({
  imports: [CommonModule, ScrollingModule],
  declarations: [CnVirtualListComponent],
  exports: [CnVirtualListComponent, ScrollingModule]
})
export class CnVirtualListModule {}
