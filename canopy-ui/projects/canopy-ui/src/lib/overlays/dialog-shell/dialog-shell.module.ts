import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CnConfirmDialogComponent } from './confirm-dialog.component';
import { CnDialogShellComponent } from './dialog-shell.component';

@NgModule({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  declarations: [CnDialogShellComponent, CnConfirmDialogComponent],
  exports: [CnDialogShellComponent, CnConfirmDialogComponent, MatDialogModule]
})
export class CnDialogShellModule {}
