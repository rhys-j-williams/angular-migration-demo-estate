import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskModule } from 'ngx-mask';
import { CnMaskedInputComponent } from './masked-input.component';

@NgModule({
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, NgxMaskModule.forChild()],
  declarations: [CnMaskedInputComponent],
  exports: [CnMaskedInputComponent]
})
export class CnMaskedInputModule {}
