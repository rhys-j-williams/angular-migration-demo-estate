import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CnDividerComponent } from './divider.component';

@NgModule({ imports: [CommonModule, MatDividerModule], declarations: [CnDividerComponent], exports: [CnDividerComponent] })
export class CnDividerModule {}
