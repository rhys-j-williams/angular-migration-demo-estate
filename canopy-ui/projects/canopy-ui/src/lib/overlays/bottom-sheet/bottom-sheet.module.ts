import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CnBottomSheetComponent } from './bottom-sheet.component';

@NgModule({
  imports: [CommonModule, MatBottomSheetModule, MatButtonModule, MatIconModule],
  declarations: [CnBottomSheetComponent],
  exports: [CnBottomSheetComponent, MatBottomSheetModule]
})
export class CnBottomSheetModule {}
