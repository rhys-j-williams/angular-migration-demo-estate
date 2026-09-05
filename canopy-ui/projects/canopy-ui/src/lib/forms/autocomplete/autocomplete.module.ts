import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CnAutocompleteComponent } from './autocomplete.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatProgressSpinnerModule],
  declarations: [CnAutocompleteComponent],
  exports: [CnAutocompleteComponent]
})
export class CnAutocompleteModule {}
