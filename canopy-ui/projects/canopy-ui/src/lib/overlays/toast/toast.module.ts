import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CnToastComponent } from './toast.component';

@NgModule({
  imports: [CommonModule, MatSnackBarModule, MatButtonModule, MatIconModule],
  declarations: [CnToastComponent],
  exports: [CnToastComponent, MatSnackBarModule]
})
export class CnToastModule {}
