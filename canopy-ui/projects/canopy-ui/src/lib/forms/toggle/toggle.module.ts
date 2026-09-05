import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CnToggleComponent } from './toggle.component';

@NgModule({
  imports: [CommonModule, MatSlideToggleModule],
  declarations: [CnToggleComponent],
  exports: [CnToggleComponent]
})
export class CnToggleModule {}
