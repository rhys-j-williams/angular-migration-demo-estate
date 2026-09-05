import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CnColumnDefDirective } from './column-def.directive';
import { CnDataTableComponent } from './data-table.component';

@NgModule({
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatProgressBarModule],
  declarations: [CnDataTableComponent, CnColumnDefDirective],
  exports: [CnDataTableComponent, CnColumnDefDirective]
})
export class CnDataTableModule {}
