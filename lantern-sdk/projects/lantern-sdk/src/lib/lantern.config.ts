import { InjectionToken } from '@angular/core';

/**
 * Configuration handed to LanternModule.forRoot(). Mirrors the vendor snippet's init options, so
 * the values in an application's environment.ts can be passed straight through.
 */
export interface LanternConfig {
  /** Lumenview project write key. Not a secret, but do not use the prod key in UAT (LNTN-388). */
  writeKey: string;
  /**
   * Where the vendor script is loaded from. Defaults to the Meridian hosted copy; the vendor CDN
   * is blocked by the egress proxy in every environment except the analytics sandbox.
   */
  scriptUrl?: string;
  /** Collector endpoint the vendor script posts to. Defaults to whatever the script was built with. */
  collectorUrl?: string;
  /** Fire a page event on every router NavigationEnd. Default true. */
  trackRouterEvents?: boolean;
  /** Add the X-Analytics-Session header to outbound HttpClient requests. Default true. */
  attachSessionHeader?: boolean;
  /**
   * Only requests whose URL starts with one of these prefixes get the session header. Empty list
   * means every request, which GIS were not happy about (GIS-1471), so applications should set it.
   */
  sessionHeaderUrlPrefixes?: string[];
  /** Header name. Default X-Analytics-Session. Changing it needs a Splunk field extraction change too. */
  sessionHeaderName?: string;
  /** Turn everything into a no-op. Used by the e2e suites and the business-web QA environment. */
  disabled?: boolean;
  /** Log every call to console.debug. Never on in prod, obviously. */
  debug?: boolean;
  /** Application name sent as a context property on every event, e.g. retail-web. */
  appName?: string;
  /** Application version sent alongside appName. Usually environment.version. */
  appVersion?: string;
}

export const LANTERN_CONFIG = new InjectionToken<LanternConfig>('LANTERN_CONFIG');

export const LANTERN_DEFAULTS: Required<Omit<LanternConfig, 'writeKey' | 'appName' | 'appVersion' | 'collectorUrl'>> = {
  scriptUrl: 'https://static.meridiantrust.example/vendor/lantern/4/lantern.min.js',
  trackRouterEvents: true,
  attachSessionHeader: true,
  sessionHeaderUrlPrefixes: [],
  sessionHeaderName: 'X-Analytics-Session',
  disabled: false,
  debug: false
};

export function resolveConfig(config: LanternConfig): LanternConfig & typeof LANTERN_DEFAULTS {
  return { ...LANTERN_DEFAULTS, ...config };
}
