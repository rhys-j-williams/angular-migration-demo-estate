import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, of } from 'rxjs';
import { catchError, filter, map, tap, timeout } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AppConfig } from './app-config.model';

/**
 * Runtime configuration. Loaded once by the APP_INITIALIZER in core.module.ts before anything else
 * in the app is constructed, so every other service can call `config.value` synchronously.
 *
 * Uses HttpBackend rather than HttpClient on purpose: HttpClient would run the interceptor chain,
 * and the bearer token interceptor needs the Keystone issuer from this very file to decide which
 * hosts get a token (MOL-2735, the "config request has a stale token on it" incident).
 *
 * Local overrides: if assets/config/env.local.json exists it is merged over env.json. That file is
 * gitignored. Do not add environment detection by hostname here, we did that once (2020) and it
 * pointed a UAT build at PROD Keystone.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http: HttpClient;
  private readonly config$ = new BehaviorSubject<AppConfig | null>(null);

  constructor(backend: HttpBackend) {
    this.http = new HttpClient(backend);
  }

  get value(): AppConfig {
    const cfg = this.config$.getValue();
    if (!cfg) {
      throw new Error('ConfigService.value read before load() completed. Is the APP_INITIALIZER registered?');
    }
    return cfg;
  }

  get loaded(): boolean {
    return this.config$.getValue() !== null;
  }

  /** Emits once config is available and then on any reload. */
  get config(): Observable<AppConfig> {
    return this.config$.asObservable().pipe(filter((c): c is AppConfig => c !== null));
  }

  async load(): Promise<AppConfig> {
    const base = await lastValueFrom(
      this.http.get<AppConfig>(this.cacheBust(environment.configPath)).pipe(timeout(8000))
    );
    const local = environment.production
      ? {}
      : await lastValueFrom(
          this.http.get<Partial<AppConfig>>(this.cacheBust('assets/config/env.local.json')).pipe(
            catchError(() => of({} as Partial<AppConfig>))
          )
        );
    const merged = this.merge(base, local);
    this.validate(merged);
    this.config$.next(merged);
    return merged;
  }

  /** Used by the UAT "reload config" hidden action. Never exposed in prod builds. */
  reload(): Observable<AppConfig> {
    return this.http.get<AppConfig>(this.cacheBust(environment.configPath)).pipe(
      tap(cfg => this.validate(cfg)),
      tap(cfg => this.config$.next(cfg)),
      map(cfg => cfg)
    );
  }

  private validate(cfg: AppConfig): void {
    const missing: string[] = [];
    if (!cfg.apiBaseUrl) missing.push('apiBaseUrl');
    if (!cfg.keystone?.issuer) missing.push('keystone.issuer');
    if (!cfg.keystone?.clientId) missing.push('keystone.clientId');
    if (!cfg.session?.idleLogoutSeconds) missing.push('session.idleLogoutSeconds');
    if (!cfg.transfers?.mfaStepUpThresholdMinor && cfg.transfers?.mfaStepUpThresholdMinor !== 0) {
      missing.push('transfers.mfaStepUpThresholdMinor');
    }
    if (missing.length) {
      throw new Error(`env.json is missing required keys: ${missing.join(', ')}`);
    }
    if (cfg.session.idleWarningSeconds >= cfg.session.idleLogoutSeconds) {
      throw new Error('session.idleWarningSeconds must be less than session.idleLogoutSeconds');
    }
  }

  private merge(base: AppConfig, override: Partial<AppConfig>): AppConfig {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(override) as (keyof AppConfig)[]) {
      const b = base[key];
      const o = override[key];
      out[key] = b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(o)
        ? { ...(b as object), ...(o as object) }
        : o;
    }
    return out as unknown as AppConfig;
  }

  private cacheBust(path: string): string {
    // The service worker treats env.json as an asset. Version stamping the query string means a
    // config-only redeploy is picked up on next load rather than after the next SW update cycle.
    return `${path}?v=${encodeURIComponent(environment.version)}`;
  }
}
