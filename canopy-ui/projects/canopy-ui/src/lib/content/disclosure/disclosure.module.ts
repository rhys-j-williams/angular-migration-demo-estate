import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CnSkeletonModule } from '@meridian/canopy-ui/data-display';
import { CnDisclosureComponent } from './disclosure.component';

@NgModule({
  imports: [CommonModule, MatIconModule, CnSkeletonModule],
  declarations: [CnDisclosureComponent],
  exports: [CnDisclosureComponent]
})
export class CnDisclosureModule {}
