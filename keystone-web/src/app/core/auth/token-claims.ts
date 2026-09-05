/**
 * The subset of ID token claims Keystone reads. This is the *only* place claims are typed; the
 * token itself is opaque to us beyond what angular-oauth2-oidc has already validated. Nothing in
 * this app decodes a JWT by hand (GIS-1490 finding 3) and nothing should start.
 */
export interface KeystoneClaims {
  sub: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  /** Authentication methods references, e.g. ['pwd', 'otp', 'mfa']. */
  amr?: string[];
  /** Authentication context class. loa2 means MFA was completed in this session. */
  acr?: string;
  auth_time?: number;
}

export const ACR_LOA2 = 'urn:meridian:keystone:loa2';

export function toClaims(raw: Record<string, unknown> | null | undefined): KeystoneClaims | null {
  if (!raw || typeof raw['sub'] !== 'string') {
    return null;
  }
  return {
    sub: raw['sub'],
    preferred_username: asString(raw['preferred_username']),
    email: asString(raw['email']),
    email_verified: raw['email_verified'] === true,
    name: asString(raw['name']),
    given_name: asString(raw['given_name']),
    amr: Array.isArray(raw['amr']) ? raw['amr'].filter((a): a is string => typeof a === 'string') : undefined,
    acr: asString(raw['acr']),
    auth_time: typeof raw['auth_time'] === 'number' ? raw['auth_time'] : undefined,
  };
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
