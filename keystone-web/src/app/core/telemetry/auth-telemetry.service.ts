import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export type AuthEvent =
  | 'login.shown'
  | 'login.submitted'
  | 'login.failed'
  | 'mfa.shown'
  | 'mfa.channel_changed'
  | 'mfa.passed'
  | 'mfa.failed'
  | 'push.timeout'
  | 'device.enrolled'
  | 'device.declined'
  | 'stepup.shown'
  | 'stepup.completed'
  | 'recovery.started'
  | 'ratelimit.shown';

/**
 * Funnel events for the identity dashboard. Names are a contract with the Splunk saved searches
 * (KEY-1544); renaming one silently breaks the conversion chart. Payloads carry no identifiers:
 * no username, no txn id, no email (PRV-0119). If you need to debug a specific customer, use the
 * correlation id on the IdP side.
 */
@Injectable({ providedIn: 'root' })
export class AuthTelemetryService {
  private readonly buffer: Array<{ event: AuthEvent; at: number; detail?: string }> = [];

  record(event: AuthEvent, detail?: string): void {
    this.buffer.push({ event, at: Date.now(), detail });
    if (!environment.telemetryEnabled) {
      return;
    }
    if (this.buffer.length >= 10) {
      this.flush();
    }
  }

  flush(): void {
    if (!environment.telemetryEnabled || this.buffer.length === 0) {
      this.buffer.length = 0;
      return;
    }
    const body = JSON.stringify({ channel: 'keystone-web', events: this.buffer.splice(0) });
    // sendBeacon so a redirect to the calling app does not lose the tail of the funnel.
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(`${environment.bffBaseUrl}/telemetry/v1/auth-funnel`, body);
    }
  }

  /** Test seam. */
  pending(): number {
    return this.buffer.length;
  }
}
