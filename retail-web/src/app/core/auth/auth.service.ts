import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, OAuthErrorEvent, OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { KeystoneClaims, LogoutReason } from './session-claims.model';

/**
 * Keystone (OIDC, authorization code + PKCE) session for Meridian Online.
 *
 * Wraps angular-oauth2-oidc so the rest of the app never touches OAuthService directly. Tokens
 * are kept in sessionStorage (see keystone-storage.ts) - never localStorage, GIS-1180 finding 1 -
 * and the access token lives 15 minutes with silent refresh through the hidden iframe.
 *
 * Step-up: transfers above the configured threshold need an MFA claim younger than ten minutes.
 * `mfaAgeSeconds()` reads `mfa_at` off the ID token; `stepUp()` sends the customer back to
 * Keystone with acr_values set so they only re-do the second factor, not the password. The
 * MfaStepUpGuard is the only caller of stepUp today; the card PIN reveal (MOL-4102) will be the
 * second.
 */
@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  static readonly RETURN_URL_KEY = 'mol.auth.returnUrl';

  private readonly authenticated$ = new BehaviorSubject<boolean>(false);
  private readonly events: Subscription;
  private discoveryDone = false;

  constructor(
    private readonly oauth: OAuthService,
    private readonly config: ConfigService,
    private readonly router: Router
  ) {
    this.events = this.oauth.events.subscribe(e => this.onOAuthEvent(e));
  }

  ngOnDestroy(): void {
    this.events.unsubscribe();
  }

  /** Called from the APP_INITIALIZER after config has loaded. Does discovery and finishes a code flow if we are on the callback. */
  async initialise(): Promise<void> {
    const ks = this.config.value.keystone;
    const authConfig: AuthConfig = {
      issuer: ks.issuer,
      clientId: ks.clientId,
      scope: ks.scope,
      redirectUri: ks.redirectUri,
      silentRefreshRedirectUri: ks.silentRefreshRedirectUri,
      postLogoutRedirectUri: ks.postLogoutRedirectUri,
      responseType: 'code',
      useSilentRefresh: true,
      silentRefreshTimeout: 10000,
      timeoutFactor: 0.75,
      sessionChecksEnabled: false,
      showDebugInformation: false,
      requireHttps: ks.requireHttps,
      strictDiscoveryDocumentValidation: false,
      clearHashAfterLogin: true,
      // The mock and the real Keystone both put the tenant path in the issuer; skipIssuerCheck was
      // needed in 2021 for the old issuer format and has stayed off since KEY-0790.
      skipIssuerCheck: false
    };
    this.oauth.configure(authConfig);
    this.oauth.setupAutomaticSilentRefresh();
    // tryLogin finishes the code exchange when we are on /auth/callback. Navigation to the
    // remembered URL is left to AuthCallbackComponent: doing it from inside an APP_INITIALIZER
    // races the router's own enabledBlocking initial navigation (MOL-3455).
    await this.oauth.loadDiscoveryDocumentAndTryLogin();
    this.discoveryDone = true;
    this.authenticated$.next(this.hasValidSession());
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authenticated$.asObservable().pipe(distinctUntilChanged());
  }

  get isAuthenticated(): boolean {
    return this.hasValidSession();
  }

  get accessToken(): string | null {
    return this.oauth.hasValidAccessToken() ? this.oauth.getAccessToken() : null;
  }

  get claims(): KeystoneClaims | null {
    const c = this.oauth.getIdentityClaims();
    return c && typeof c === 'object' ? (c as unknown as KeystoneClaims) : null;
  }

  get customerId(): string | null {
    return this.claims?.customer_id ?? this.claims?.sub ?? null;
  }

  get displayName$(): Observable<string | null> {
    return this.isAuthenticated$.pipe(map(ok => (ok ? this.claims?.given_name ?? this.claims?.name ?? null : null)));
  }

  /**
   * Seconds since the customer last completed MFA in this Keystone session, or null if the token
   * has no mfa_at (password only login, or a very old Keystone).
   */
  mfaAgeSeconds(now: number = Date.now()): number | null {
    const at = this.claims?.mfa_at;
    if (!at) {
      return null;
    }
    return Math.max(0, Math.floor(now / 1000) - at);
  }

  hasRecentMfa(maxAgeSeconds: number): boolean {
    const age = this.mfaAgeSeconds();
    return age !== null && age <= maxAgeSeconds;
  }

  /** Full login. Remembers where the customer was so the callback can send them back. */
  login(returnUrl?: string): void {
    this.rememberReturnUrl(returnUrl);
    this.oauth.initCodeFlow();
  }

  /**
   * MFA step-up. Same code flow, but with acr_values so Keystone only asks for the second factor
   * and a `prompt=login` fallback for tenants that ignore acr (the 2022 Keystone did).
   */
  stepUp(returnUrl: string): void {
    this.rememberReturnUrl(returnUrl);
    this.oauth.initCodeFlow(undefined, {
      acr_values: this.config.value.keystone.stepUpAcr,
      prompt: 'login',
      // Keystone shows a different banner for step-up so the customer knows why they were asked.
      // Keystone calls this "reason", see KEY-1260.
      reason: 'step-up'
    });
  }

  /** Attempts a silent refresh. Resolves false if Keystone says the session is gone. */
  async refresh(): Promise<boolean> {
    try {
      await this.oauth.silentRefresh();
      return this.hasValidSession();
    } catch {
      return false;
    }
  }

  logout(reason: LogoutReason = 'user'): void {
    sessionStorage.removeItem(AuthService.RETURN_URL_KEY);
    this.authenticated$.next(false);
    if (reason === 'idle' || reason === 'token-expired') {
      // Local logout only: the Keystone session may be perfectly fine (another tab), and sending
      // the customer through the IdP logout for an idle timeout was the top complaint in the
      // post-MOL-4412 survey. The logged-out page explains what happened.
      this.oauth.logOut(true);
      void this.router.navigate(['/logged-out'], { queryParams: { reason } });
      return;
    }
    this.oauth.logOut();
  }

  private hasValidSession(): boolean {
    return this.discoveryDone && this.oauth.hasValidAccessToken() && this.oauth.hasValidIdToken();
  }

  private rememberReturnUrl(url?: string): void {
    const target = url ?? this.router.url;
    if (target && target !== '/' && !target.startsWith('/auth/') && !target.startsWith('/logged-out')) {
      sessionStorage.setItem(AuthService.RETURN_URL_KEY, target);
    }
  }

  /** Returns and clears the URL remembered by login()/stepUp(). Defaults to the dashboard. */
  consumeReturnUrl(): string {
    const url = sessionStorage.getItem(AuthService.RETURN_URL_KEY);
    sessionStorage.removeItem(AuthService.RETURN_URL_KEY);
    return url && url.startsWith('/') ? url : '/dashboard';
  }

  private onOAuthEvent(event: OAuthEvent): void {
    switch (event.type) {
      case 'token_received':
      case 'token_refreshed':
      case 'silently_refreshed':
        this.authenticated$.next(this.hasValidSession());
        break;
      case 'token_expires':
        // angular-oauth2-oidc fires this at timeoutFactor; the automatic silent refresh handles it.
        break;
      case 'silent_refresh_error':
      case 'token_refresh_error':
      case 'session_terminated':
      case 'session_error':
        if (event instanceof OAuthErrorEvent) {
          console.warn('[mol.auth] refresh failed', event.type);
        }
        if (this.authenticated$.getValue()) {
          this.logout('token-expired');
        }
        break;
      default:
        break;
    }
  }
}
