import { InjectionToken } from '@angular/core';

/**
 * Per-mount configuration. Comes from attributes on <meridian-iris-widget>, set by the host page;
 * see README "Mount contract". Defaults are for the dev shell and the harness.
 *
 * bearerToken: the orchestrator binds a session to the customer in the Keystone token, so the host
 * has to hand us one. retail-web sets the attribute from its OAuthService after login and clears it
 * on logout (MOL-4120). We never read storage or cookies for it ourselves; that was reviewed and
 * refused in GIS-1522.
 */
export interface IrisWidgetConfig {
  orchestratorUrl: string;
  channel: string;
  bearerToken: string | null;
}

export const DEFAULT_WIDGET_CONFIG: IrisWidgetConfig = {
  orchestratorUrl: 'http://localhost:4517',
  channel: 'web',
  bearerToken: null,
};

export const IRIS_WIDGET_CONFIG = new InjectionToken<IrisWidgetConfig>('IRIS_WIDGET_CONFIG');
