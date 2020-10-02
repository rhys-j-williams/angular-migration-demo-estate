/**
 * Claims Keystone puts in the ID token that the app reads. Anything else in the token is ignored.
 * Field names follow Keystone's OIDC profile document (KEY-0412), which is why they are snake_case.
 */
export interface KeystoneClaims {
  sub: string;
  /** Opaque customer id, CUS-xxxxxxxx. The only identifier that leaves the browser to Lantern. */
  customer_id?: string;
  name?: string;
  given_name?: string;
  email?: string;
  /** Authentication methods references, e.g. ['pwd'] or ['pwd', 'otp']. */
  amr?: string[];
  acr?: string;
  /** Epoch seconds of the most recent MFA completion in this Keystone session. */
  mfa_at?: number;
  auth_time?: number;
  exp: number;
  iat: number;
}

export type LogoutReason = 'user' | 'idle' | 'token-expired' | 'step-up-failed' | 'server-401';
