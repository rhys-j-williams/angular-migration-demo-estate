import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/**
 * Minor units -> formatted currency. `{{ 123456 | minorAmount }}` -> "$1,234.56".
 * `signed` puts an explicit + on credits, which the transaction list wants and balances do not.
 * Wraps Intl directly rather than CurrencyPipe because CurrencyPipe wants major units and every
 * call site was dividing by 100 (MOL-1502).
 */
@Pipe({ name: 'minorAmount' })
export class MinorAmountPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  transform(minor: number | null | undefined, currency = 'USD', signed = false): string {
    if (minor === null || minor === undefined || Number.isNaN(minor)) {
      return '';
    }
    const formatted = new Intl.NumberFormat(this.locale, { style: 'currency', currency }).format(minor / 100);
    return signed && minor > 0 ? `+${formatted}` : formatted;
  }
}
