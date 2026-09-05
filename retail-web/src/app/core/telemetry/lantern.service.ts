import { Injectable } from '@angular/core';
import { LanternModule, LanternProperties, LanternService as LanternSdkService, LanternWindow } from '@meridian/lantern-sdk';

import { AuthService } from '../auth/auth.service';

/**
 * Application facade over the Lantern analytics SDK.
 *
 * The SDK (@meridian/lantern-sdk, owned by the Digital Analytics team) is registered once in
 * CoreModule with LanternModule.forRoot(...) and handles the vendor script, the router page
 * events and the X-Analytics-Session header. This service exists so feature code calls
 * `lantern.track('transfer.submitted', ...)` with our naming conventions and never talks to the
 * SDK or to window.Lantern directly.
 *
 * Event names: `<feature>.<object>.<verb>` in lowercase, past tense for things that happened
 * ('transfer.submitted') and present for intent ('transfer.stepup.required'). The catalogue is in
 * docs/analytics-events.md; add there first.
 *
 * `window.Lantern` is read directly in one place, `vendorVersion`, for the UAT diagnostics page,
 * because the SDK does not expose it. That read is the reason this file references LanternWindow.
 */
@Injectable({ providedIn: 'root' })
export class LanternService {
  static readonly module = LanternModule;

  constructor(private readonly sdk: LanternSdkService, private readonly auth: AuthService) {}

  track(event: string, properties?: LanternProperties): void {
    this.sdk.track(event, this.withDefaults(properties));
  }

  page(name: string, properties?: LanternProperties): void {
    this.sdk.page(name, this.withDefaults(properties));
  }

  /** Called by session effects once the ID token is available. Opaque customer id only. */
  identifyCurrentCustomer(): void {
    const id = this.auth.customerId;
    if (id) {
      this.sdk.identify(id, { segment: 'consumer', app: 'retail-web' });
    }
  }

  reset(): void {
    this.sdk.reset();
  }

  get sessionId(): string {
    return this.sdk.sessionId();
  }

  get enabled(): boolean {
    return this.sdk.enabled;
  }

  get vendorVersion(): string | null {
    const w = window as LanternWindow;
    return w.Lantern?.SDK_VERSION ?? null;
  }

  private withDefaults(properties?: LanternProperties): LanternProperties {
    return { channel: 'web', authenticated: this.auth.isAuthenticated, ...(properties ?? {}) };
  }
}
