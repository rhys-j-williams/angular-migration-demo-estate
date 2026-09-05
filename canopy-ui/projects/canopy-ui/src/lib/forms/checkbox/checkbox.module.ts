import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CnCheckboxComponent } from './checkbox.component';

@NgModule({
  imports: [CommonModule, MatCheckboxModule],
  declarations: [CnCheckboxComponent],
  exports: [CnCheckboxComponent]
})
export class CnCheckboxModule {}
