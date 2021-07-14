import { Injectable } from '@angular/core';

/**
 * Step-up is the same code flow with acr_values=loa2 and prompt=login. The calling application
 * sends us to /step-up?return_to=<url>&reason=<code>; we stash return_to in the OIDC state and
 * bounce the customer back with the fresh code when the IdP is done. The calling app exchanges
 * that code itself.
 *
 * return_to is validated against the allow list below. Open redirect was GIS-1490 finding 2 and
 * again GIS-1877 when someone added a wildcard. No wildcards.
 */
@Injectable({ providedIn: 'root' })
export class StepUpService {
  private readonly allowedReturnOrigins = [
    'http://localhost:4200', // retail-web
    'http://localhost:4201', // business-web
    'http://localhost:4203', // ledgerline
    'http://localhost:4210', // wealth portal (SAML side, but it links here for recovery)
    'https://online.meridiantrust.example',
    'https://business.meridiantrust.example',
    'https://ledgerline.meridiantrust.example',
  ];

  readonly reasons: Record<string, string> = {
    'payment.external': 'Sending money to a new payee',
    'payment.high-value': 'A payment over your daily limit',
    'profile.contact': 'Changing your contact details',
    'card.reissue': 'Ordering a replacement card',
    'wire.domestic': 'Sending a wire',
    'limits.change': 'Changing a limit',
  };

  isAllowedReturn(url: string | null): url is string {
    if (!url) {
      return false;
    }
    try {
      const parsed = new URL(url);
      return this.allowedReturnOrigins.includes(parsed.origin) && (parsed.protocol === 'https:' || parsed.hostname === 'localhost');
    } catch {
      return false;
    }
  }

  describe(reason: string | null): string {
    return (reason && this.reasons[reason]) || 'Confirming it is you';
  }

  encodeState(returnTo: string, reason: string | null): string {
    return btoa(JSON.stringify({ r: returnTo, why: reason, t: Date.now() }));
  }

  decodeState(state: string | null): { returnTo: string | null; reason: string | null } {
    if (!state) {
      return { returnTo: null, reason: null };
    }
    try {
      const parsed = JSON.parse(atob(state)) as { r?: unknown; why?: unknown };
      const returnTo = typeof parsed.r === 'string' ? parsed.r : null;
      return { returnTo: this.isAllowedReturn(returnTo) ? returnTo : null, reason: typeof parsed.why === 'string' ? parsed.why : null };
    } catch {
      return { returnTo: null, reason: null };
    }
  }
}
