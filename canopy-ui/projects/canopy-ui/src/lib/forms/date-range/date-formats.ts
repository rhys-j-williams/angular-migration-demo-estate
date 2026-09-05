import { MatDateFormats } from '@angular/material/core';

/**
 * US bank statement style: 03/14/2024 in inputs, "Mar 14, 2024" in labels. Registered against
 * the moment adapter in CnDateRangeModule.
 */
export const CN_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: ['MM/DD/YYYY', 'M/D/YYYY', 'YYYY-MM-DD']
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
