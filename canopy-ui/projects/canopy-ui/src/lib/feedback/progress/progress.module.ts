import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CnProgressComponent } from './progress.component';

@NgModule({
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  declarations: [CnProgressComponent],
  exports: [CnProgressComponent]
})
export class CnProgressModule {}
