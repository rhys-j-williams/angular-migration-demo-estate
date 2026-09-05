import { ChangeDetectionStrategy, Component } from '@angular/core';

/** 1099-INT and 1098 forms by tax year. */
@Component({
  selector: 'mol-tax-documents',
  templateUrl: './tax-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxDocumentsComponent {}
