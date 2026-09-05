import { TestBed } from '@angular/core/testing';
import { CnCurrencyFormatService } from './currency-format.service';

describe('CnCurrencyFormatService', () => {
  let service: CnCurrencyFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnCurrencyFormatService);
  });

  it('formats USD in en-US by default', () => {
    expect(service.format(1234.5)).toBe('$1,234.50');
  });

  it('formats an explicit currency', () => {
    expect(service.format(10, 'EUR', 'de-DE')).toContain('10,00');
  });

  it('returns an empty string for null', () => {
    expect(service.format(null)).toBe('');
    expect(service.format(NaN)).toBe('');
  });

  it('parses grouped and symbol prefixed input', () => {
    expect(service.parse('$1,234.50')).toBe(1234.5);
    expect(service.parse('1234')).toBe(1234);
  });

  it('parses accounting negatives', () => {
    expect(service.parse('(12.00)')).toBe(-12);
    expect(service.parse('-3.5')).toBe(-3.5);
  });

  it('parses garbage to null', () => {
    expect(service.parse('')).toBeNull();
    expect(service.parse('abc')).toBeNull();
    expect(service.parse(undefined)).toBeNull();
  });

  it('exposes the currency symbol', () => {
    expect(service.symbol()).toBe('$');
  });
});
