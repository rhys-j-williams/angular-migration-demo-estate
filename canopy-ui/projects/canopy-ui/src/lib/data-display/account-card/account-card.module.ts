import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CnAccountCardComponent } from './account-card.component';

@NgModule({
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  declarations: [CnAccountCardComponent],
  exports: [CnAccountCardComponent]
})
export class CnAccountCardModule {}
