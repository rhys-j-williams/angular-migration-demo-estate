/**
 * Shape of window.Lantern as exposed by the Lumenview Lantern Web SDK 4.x. Typed by hand from the
 * vendor's integration guide (rev 4.11, in the DAE Confluence space) because the vendor does not
 * ship typings. If the vendor changes the surface we find out in UAT, not here.
 */
export interface LanternVendorApi {
  /** calls made before the script finished loading; the SDK drains this on load */
  q?: unknown[][];
  SDK_VERSION?: string;
  load(writeKey: string, options?: { collectorUrl?: string; debug?: boolean }): void;
  track(event: string, properties?: LanternProperties): void;
  page(name?: string, properties?: LanternProperties): void;
  identify(userId: string, traits?: LanternProperties): void;
  group?(groupId: string, traits?: LanternProperties): void;
  reset?(): void;
  /** present on the snippet stub and on the loaded SDK; returns the analytics session id */
  sessionId?(): string;
}

export type LanternProperties = Record<string, string | number | boolean | null | undefined>;

export interface LanternWindow extends Window {
  Lantern?: LanternVendorApi;
}

/**
 * Minimal stand-in installed before the vendor script arrives: queues calls in the same `q` array
 * the real snippet uses, so nothing is lost if the first page event fires before the script loads.
 */
export function installQueueStub(win: LanternWindow): LanternVendorApi {
  if (win.Lantern) {
    return win.Lantern;
  }
  const q: unknown[][] = [];
  const push = (method: string) => (...args: unknown[]) => { q.push([method, ...args]); };
  const stub: LanternVendorApi = {
    q,
    load: push('load') as LanternVendorApi['load'],
    track: push('track'),
    page: push('page'),
    identify: push('identify'),
    group: push('group'),
    reset: push('reset')
  };
  win.Lantern = stub;
  return stub;
}
