import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { buildAuthConfig } from './auth-config';
import { ACR_LOA2, KeystoneClaims, toClaims } from './token-claims';

/**
 * Thin wrapper over angular-oauth2-oidc. Feature code talks to this, never to OAuthService
 * directly, so the discovery/PKCE/redirect plumbing lives in exactly one place.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly claims$ = new BehaviorSubject<KeystoneClaims | null>(null);
  private configured = false;

  constructor(private readonly oauth: OAuthService) {}

  get claims(): Observable<KeystoneClaims | null> {
    return this.claims$.asObservable();
  }

  async configure(): Promise<void> {
    if (this.configured) {
      return;
    }
    this.oauth.configure(buildAuthConfig(environment));
    this.oauth.events.subscribe((e) => {
      if (e.type === 'token_received' || e.type === 'discovery_document_loaded') {
        this.claims$.next(toClaims(this.oauth.getIdentityClaims() as Record<string, unknown> | null));
      }
      if (e.type === 'token_expires' || e.type === 'logout') {
        this.claims$.next(null);
      }
    });
    await this.oauth.loadDiscoveryDocument();
    this.configured = true;
  }

  /**
   * Handles the ?code= callback. Returns true when a token was obtained. The state parameter
   * carries the calling application's return URL, see StepUpService.
   */
  async completeLogin(): Promise<boolean> {
    await this.configure();
    const ok = await this.oauth.tryLoginCodeFlow();
    this.claims$.next(toClaims(this.oauth.getIdentityClaims() as Record<string, unknown> | null));
    return ok && this.oauth.hasValidIdToken();
  }

  /** Kick off the code flow. `state` is opaque to the IdP and round-trips untouched. */
  async startLogin(state?: string, extraParams: Record<string, string> = {}): Promise<void> {
    await this.configure();
    this.oauth.initCodeFlow(state, extraParams);
  }

  startStepUp(state: string): Promise<void> {
    // The IdP reads acr_values and forces a fresh MFA if the session's is older than 10 minutes.
    return this.startLogin(state, { acr_values: ACR_LOA2, prompt: 'login' });
  }

  hasMfa(): boolean {
    const c = toClaims(this.oauth.getIdentityClaims() as Record<string, unknown> | null);
    return c?.acr === ACR_LOA2 || (c?.amr ?? []).includes('mfa');
  }

  accessToken(): string | null {
    return this.oauth.hasValidAccessToken() ? this.oauth.getAccessToken() : null;
  }

  returnedState(): string | null {
    return this.oauth.state ?? null;
  }

  logout(): void {
    this.oauth.logOut();
  }
}
