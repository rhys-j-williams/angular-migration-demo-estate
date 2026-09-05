import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CnTooltipDirective } from './tooltip.directive';
import { CnTooltipStylesComponent } from './tooltip-styles.component';

@NgModule({
  imports: [MatTooltipModule],
  declarations: [CnTooltipDirective, CnTooltipStylesComponent],
  exports: [CnTooltipDirective, CnTooltipStylesComponent, MatTooltipModule]
})
export class CnTooltipModule {}
