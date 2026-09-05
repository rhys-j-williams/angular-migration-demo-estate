import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

export interface FingerprintInputs {
  userAgent: string;
  language: string;
  languages: string;
  platform: string;
  hardwareConcurrency: number;
  timezone: string;
  screen: string;
  colorDepth: number;
  touchPoints: number;
}

export interface DeviceFingerprint {
  /** Hex SHA-256 of the canonical input string. This is what goes to the fraud service. */
  hash: string;
  /** Version of the input recipe; bump when the field list changes so Fraud can re-baseline. */
  version: number;
}

export const FINGERPRINT_VERSION = 3;

/**
 * Device fingerprint for the fraud team's device trust and risk scoring (FRD-0288, refreshed in
 * FRD-0561 when v3 added timezone and hardwareConcurrency).
 *
 * What this is: a stable-ish, low entropy label for "this browser on this machine" that Fraud
 * correlates with the trusted device cookie. If the cookie is present but the fingerprint moved
 * a lot, the login is scored higher risk and step-up is forced. That is the whole requirement.
 *
 * What this is not: identification. FRD-0288 was reviewed by Privacy (PRV-0119) with the explicit
 * constraint that the inputs are things the browser already sends on every request or exposes
 * to every page, that no canvas/WebGL/audio probing is done, that nothing is written to storage
 * by this service, and that the raw inputs never leave the browser: only the hash does. The
 * version number goes along so the fraud model knows which recipe produced it.
 *
 * If you want to add a field, you need an FRD ticket and a PRV review. Do not add a field.
 */
@Injectable({ providedIn: 'root' })
export class DeviceFingerprintService {
  compute(): Observable<DeviceFingerprint> {
    return from(this.computeAsync());
  }

  collect(nav: Navigator = navigator, scr: Screen = screen): FingerprintInputs {
    return {
      userAgent: nav.userAgent,
      language: nav.language,
      languages: (nav.languages ?? []).join(','),
      platform: nav.platform,
      hardwareConcurrency: nav.hardwareConcurrency ?? 0,
      timezone: safeTimezone(),
      screen: `${scr.width}x${scr.height}`,
      colorDepth: scr.colorDepth,
      touchPoints: nav.maxTouchPoints ?? 0,
    };
  }

  /** Deterministic serialisation; key order is part of the recipe and must not change within a version. */
  canonical(inputs: FingerprintInputs): string {
    return [
      `v${FINGERPRINT_VERSION}`,
      inputs.userAgent,
      inputs.language,
      inputs.languages,
      inputs.platform,
      String(inputs.hardwareConcurrency),
      inputs.timezone,
      inputs.screen,
      String(inputs.colorDepth),
      String(inputs.touchPoints),
    ].join('|');
  }

  async hash(text: string): Promise<string> {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async computeAsync(): Promise<DeviceFingerprint> {
    const hash = await this.hash(this.canonical(this.collect()));
    return { hash, version: FINGERPRINT_VERSION };
  }
}

function safeTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
