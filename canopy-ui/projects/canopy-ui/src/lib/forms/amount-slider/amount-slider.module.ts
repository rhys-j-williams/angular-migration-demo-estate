import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { CnAmountSliderComponent } from './amount-slider.component';

@NgModule({
  imports: [CommonModule, MatSliderModule],
  declarations: [CnAmountSliderComponent],
  exports: [CnAmountSliderComponent]
})
export class CnAmountSliderModule {}
