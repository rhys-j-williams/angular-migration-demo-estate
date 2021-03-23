import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CnCardComponent } from './card.component';

@NgModule({ imports: [CommonModule, MatCardModule], declarations: [CnCardComponent], exports: [CnCardComponent] })
export class CnCardModule {}
