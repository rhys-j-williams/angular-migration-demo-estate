import { AuthConfig } from 'angular-oauth2-oidc';

import { KeystoneEnvironment } from '../../../environments/environment.model';

/**
 * Authorization code + PKCE against the Keystone IdP. keystone-web is a public client
 * (no secret), registered as `keystone-web` with the three redirect URIs listed in the IdP's
 * client table. Implicit flow was switched off in KEY-1611 after GIS-1490; do not turn it back on
 * for a "quick test", the IdP rejects it anyway.
 *
 * The access token is only used for the BFF calls Keystone itself makes (device trust, recovery
 * status). Everything downstream gets its own token from the redirect back to the calling app.
 */
export function buildAuthConfig(env: KeystoneEnvironment): AuthConfig {
  return {
    issuer: env.issuer,
    clientId: env.clientId,
    redirectUri: env.redirectUri,
    postLogoutRedirectUri: env.postLogoutRedirectUri,
    responseType: 'code',
    scope: 'openid profile email',
    // The mock IdP only speaks http on localhost. requireHttps is true everywhere else and is
    // asserted by a test in auth-config.spec.ts so it cannot drift.
    requireHttps: env.requireHttps,
    strictDiscoveryDocumentValidation: env.requireHttps,
    showDebugInformation: !env.production,
    // Refreshing in an iframe was disabled with the SameSite=Lax change in 2021 (KEY-0912). We do
    // not use refresh tokens; the session on the IdP is what carries the customer between apps.
    useSilentRefresh: false,
    // Angular router strips the code from the URL after we handle the callback; the library
    // would otherwise leave ?code= sitting in history.
    clearHashAfterLogin: true,
    disablePKCE: false,
    // Clock skew between the IdP pods and the CDN edge was measured at up to 90s in INC0139914.
    clockSkewInSec: 120,
    sessionChecksEnabled: false,
    customQueryParams: {},
  };
}
