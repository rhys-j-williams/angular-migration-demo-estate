import { InjectionToken } from '@angular/core';

export type CnDensity = 'default' | 'compact';
export type CnThemeName = 'light' | 'high-contrast';

/**
 * Global Canopy configuration. Provided once by the consuming application through
 * `CnCoreModule.forRoot()`; every component reads it through `CN_CONFIG`.
 */
export interface CnConfig {
  /** Locale handed to Intl formatters. Defaults to the document language. */
  locale: string;
  /** ISO 4217 code used when a component is not told otherwise. */
  currency: string;
  /** Row and control density. Ledgerline and Business run compact. */
  density: CnDensity;
  /** Theme applied on bootstrap. Persisted preference wins when present. */
  defaultTheme: CnThemeName;
  /** localStorage key for the persisted theme. Set to null to disable persistence. */
  themeStorageKey: string | null;
}

export const CN_DEFAULT_CONFIG: CnConfig = {
  locale: 'en-US',
  currency: 'USD',
  density: 'default',
  defaultTheme: 'light',
  themeStorageKey: 'meridian.canopy.theme'
};

export const CN_CONFIG = new InjectionToken<CnConfig>('CN_CONFIG', {
  providedIn: 'root',
  factory: () => CN_DEFAULT_CONFIG
});
