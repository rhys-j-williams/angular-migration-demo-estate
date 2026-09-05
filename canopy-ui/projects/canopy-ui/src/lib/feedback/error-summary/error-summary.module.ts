import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CnErrorSummaryComponent } from './error-summary.component';

@NgModule({ imports: [CommonModule, MatIconModule], declarations: [CnErrorSummaryComponent], exports: [CnErrorSummaryComponent] })
export class CnErrorSummaryModule {}
