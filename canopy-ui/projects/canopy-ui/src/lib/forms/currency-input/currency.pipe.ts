import { Pipe, PipeTransform } from '@angular/core';
import { CnCurrencyFormatService } from '@meridian/canopy-ui/core';

/** `{{ balance | cnCurrency }}` or `{{ balance | cnCurrency:'GBP' }}`. Null renders as an em dash. */
@Pipe({ name: 'cnCurrency' })
export class CnCurrencyPipe implements PipeTransform {
  constructor(private readonly formatter: CnCurrencyFormatService) {}

  transform(value: number | null | undefined, currency?: string, locale?: string): string {
    if (value === null || value === undefined) {
      return '\u2014';
    }
    return this.formatter.format(value, currency, locale);
  }
}
