import { Inject, Injectable } from '@angular/core';
import { CN_CONFIG, CnConfig } from './canopy-config';

/**
 * Shared Intl.NumberFormat cache. Building a formatter per keystroke showed up in the Ledgerline
 * profiler (LDG-1876), so instances are memoised per locale and currency.
 */
@Injectable({ providedIn: 'root' })
export class CnCurrencyFormatService {
  private readonly cache = new Map<string, Intl.NumberFormat>();

  constructor(@Inject(CN_CONFIG) private readonly config: CnConfig) {}

  format(value: number | null | undefined, currency?: string, locale?: string): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }
    return this.formatter(currency, locale).format(value);
  }

  /** Parses user input such as "1,234.50", "$1,234.50" or "(12.00)" back to a number. */
  parse(raw: string | null | undefined): number | null {
    if (raw === null || raw === undefined) {
      return null;
    }
    const trimmed = String(raw).trim();
    if (!trimmed) {
      return null;
    }
    const negative = /^\(.*\)$/.test(trimmed) || trimmed.startsWith('-');
    const digits = trimmed.replace(/[^0-9.]/g, '');
    if (!digits) {
      return null;
    }
    const parsed = Number(digits);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return negative ? -parsed : parsed;
  }

  /** The symbol for a currency in the configured locale, e.g. "$" for USD in en-US. */
  symbol(currency?: string, locale?: string): string {
    const parts = this.formatter(currency, locale).formatToParts(0);
    const part = parts.find(p => p.type === 'currency');
    return part ? part.value : '';
  }

  private formatter(currency?: string, locale?: string): Intl.NumberFormat {
    const cur = currency || this.config.currency;
    const loc = locale || this.config.locale;
    const key = loc + ':' + cur;
    let fmt = this.cache.get(key);
    if (!fmt) {
      fmt = new Intl.NumberFormat(loc, { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      this.cache.set(key, fmt);
    }
    return fmt;
  }
}
