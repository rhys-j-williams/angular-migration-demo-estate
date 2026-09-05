import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { CN_DATE_FORMATS } from './date-formats';
import { CnDateRangeComponent } from './date-range.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatMomentDateModule, MatButtonModule, MatIconModule],
  declarations: [CnDateRangeComponent],
  exports: [CnDateRangeComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: CN_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false, strict: true } }
  ]
})
export class CnDateRangeModule {}
