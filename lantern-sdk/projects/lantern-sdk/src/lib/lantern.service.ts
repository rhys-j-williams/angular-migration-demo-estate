import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LANTERN_CONFIG, LanternConfig, resolveConfig } from './lantern.config';
import { installQueueStub, LanternProperties, LanternVendorApi, LanternWindow } from './lantern.vendor';

const SESSION_STORAGE_KEY = 'mtb.lantern.session';
const SESSION_IDLE_MS = 30 * 60 * 1000;

/**
 * Thin wrapper over window.Lantern. Everything goes through here so the application code never
 * touches the vendor global directly (that was the whole point of LNTN-12, after the 2020
 * incident where three apps each loaded their own copy of the script).
 *
 * The service is safe to inject before the script has loaded: calls are queued by the snippet
 * stub and replayed by the vendor SDK when it arrives.
 */
@Injectable({ providedIn: 'root' })
export class LanternService {
  private readonly cfg: ReturnType<typeof resolveConfig>;
  private readonly win: LanternWindow | null;
  private readonly document: Document;
  private scriptRequested = false;
  private cachedSessionId: string | null = null;
  private currentUserId: string | null = null;

  constructor(
    @Optional() @Inject(LANTERN_CONFIG) config: LanternConfig | null,
    // typed as Object: View Engine's metadata collector cannot resolve the DOM `Document` type (or
    // `unknown`) in a constructor parameter under strictMetadataEmit, the classic ng-packagr complaint
    // tslint:disable-next-line:ban-types
    @Inject(DOCUMENT) doc: Object,
    // tslint:disable-next-line:ban-types
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.document = doc as Document;
    // no config means somebody imported LanternModule without forRoot(); behave as disabled rather
    // than throw, because business-web's lazy modules used to do exactly that (LNTN-301)
    this.cfg = resolveConfig(config || { writeKey: '', disabled: true });
    this.win = isPlatformBrowser(platformId) ? (this.document.defaultView as LanternWindow | null) : null;
  }

  /** True when this instance will actually send anything. */
  get enabled(): boolean {
    return !this.cfg.disabled && !!this.win && !!this.cfg.writeKey;
  }

  /**
   * Inject the vendor script tag (once) and call load(). Called by LanternModule on construction;
   * exposed so applications that gate analytics behind a cookie consent banner can call it later.
   */
  init(): void {
    if (!this.enabled || this.scriptRequested || !this.win) {
      return;
    }
    this.scriptRequested = true;
    const vendor = installQueueStub(this.win);
    vendor.load(this.cfg.writeKey, { collectorUrl: this.cfg.collectorUrl, debug: this.cfg.debug });

    const existing = this.document.querySelector(`script[data-lantern-sdk]`);
    if (existing) {
      return;
    }
    const script = this.document.createElement('script');
    script.async = true;
    script.src = this.cfg.scriptUrl;
    script.setAttribute('data-lantern-sdk', '2.4.1');
    script.onerror = () => this.debug('vendor script failed to load from ' + this.cfg.scriptUrl);
    (this.document.head || this.document.body).appendChild(script);
    this.debug('vendor script requested from ' + this.cfg.scriptUrl);
  }

  track(event: string, properties?: LanternProperties): void {
    this.call('track', event, this.withContext(properties));
  }

  page(name?: string, properties?: LanternProperties): void {
    this.call('page', name, this.withContext(properties));
  }

  /**
   * userId must be the opaque customer id (CUS-...), never the login name or email. GIS-1471
   * findings 3 and 4 were exactly that.
   */
  identify(userId: string, traits?: LanternProperties): void {
    this.currentUserId = userId;
    this.call('identify', userId, traits);
  }

  /** Clears the identified user, e.g. on logout. Also rotates the analytics session. */
  reset(): void {
    this.currentUserId = null;
    this.cachedSessionId = null;
    this.storage()?.removeItem(SESSION_STORAGE_KEY);
    const vendor = this.vendor();
    if (vendor && vendor.reset) {
      vendor.reset();
    }
  }

  /**
   * The analytics session id. Prefers the vendor's own id once the script is up; before that (and
   * always for the HTTP interceptor, which must not block on script load) uses a locally generated
   * id kept in sessionStorage with a 30 minute idle timeout, same rule as the vendor's.
   */
  sessionId(): string {
    const vendor = this.vendor();
    if (vendor && typeof vendor.sessionId === 'function') {
      const id = vendor.sessionId();
      if (id) {
        this.cachedSessionId = id;
        return id;
      }
    }
    if (this.cachedSessionId) {
      this.touchSession(this.cachedSessionId);
      return this.cachedSessionId;
    }
    const stored = this.readStoredSession();
    this.cachedSessionId = stored || this.newSessionId();
    this.touchSession(this.cachedSessionId);
    return this.cachedSessionId;
  }

  get userId(): string | null {
    return this.currentUserId;
  }

  get config(): Readonly<LanternConfig> {
    return this.cfg;
  }

  private call(method: 'track' | 'page' | 'identify', ...args: unknown[]): void {
    if (!this.enabled || !this.win) {
      this.debug(`${method} dropped (disabled)`, args);
      return;
    }
    const vendor = installQueueStub(this.win);
    this.debug(method, args);
    // tslint:disable-next-line:ban-types  the vendor api is loosely typed on purpose
    (vendor[method] as Function).apply(vendor, args);
  }

  private withContext(properties?: LanternProperties): LanternProperties {
    return {
      ...(properties || {}),
      app: this.cfg.appName,
      appVersion: this.cfg.appVersion,
      sdk: '@meridian/lantern-sdk@2.4.1'
    };
  }

  private vendor(): LanternVendorApi | undefined {
    return this.win ? this.win.Lantern : undefined;
  }

  private storage(): Storage | null {
    try {
      return this.win ? this.win.sessionStorage : null;
    } catch {
      return null; // Safari private mode, or storage disabled by group policy on the branch PCs
    }
  }

  private readStoredSession(): string | null {
    const raw = this.storage()?.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const [id, touched] = raw.split('|');
    if (!id || !touched || Date.now() - Number(touched) > SESSION_IDLE_MS) {
      return null;
    }
    return id;
  }

  private touchSession(id: string): void {
    this.storage()?.setItem(SESSION_STORAGE_KEY, `${id}|${Date.now()}`);
  }

  private newSessionId(): string {
    const cryptoApi = this.win && this.win.crypto;
    if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      cryptoApi.getRandomValues(bytes);
      return 'las_' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // IE11 fallback kept from 1.x; nobody has checked whether it is still reachable
    return 'las_' + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  private debug(message: string, detail?: unknown): void {
    if (this.cfg.debug && this.win && typeof console !== 'undefined') {
      // tslint:disable-next-line:no-console
      console.debug('[lantern-sdk] ' + message, detail === undefined ? '' : detail);
    }
  }
}
