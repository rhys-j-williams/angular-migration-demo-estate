import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { SplunkLoggerService } from '../telemetry/splunk-logger.service';
import { isAppError } from './app-error.model';

/**
 * Root ErrorHandler. Everything Angular does not catch ends up here: template errors, effect
 * failures nobody caught, promise rejections inside the zone.
 *
 * Two jobs. One, post a Splunk HEC event with the fields the digital-retail-web dashboard expects
 * (see docs/runbooks/splunk-fields.md - change the field names there first, then here). Two, for
 * the handful of errors that mean the page cannot recover (chunk load failure after a deploy,
 * the classic) navigate to something the customer can act on instead of a frozen screen.
 *
 * Injector is used lazily because ErrorHandler is created before most of the app; injecting
 * Router directly here causes a cyclic dependency through APP_INITIALIZER (MOL-1290).
 *
 * Never log the error message of an AppError with kind validation: the BFF echoes field values
 * in some of them (GIS-1471 finding 7).
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly recentFingerprints = new Map<string, number>();

  constructor(private readonly injector: Injector, private readonly zone: NgZone) {}

  handleError(error: unknown): void {
    const err = this.unwrap(error);
    const message = this.messageOf(err);

    if (this.isChunkLoadError(message)) {
      this.onChunkLoadFailure();
      return;
    }

    if (this.isDuplicate(message)) {
      return;
    }

    const logger = this.injector.get(SplunkLoggerService, null);
    if (logger) {
      logger.error('unhandled', {
        error_message: isAppError(err) && err.kind === 'validation' ? '[validation error, body suppressed]' : message,
        error_name: err instanceof Error ? err.name : typeof err,
        error_kind: isAppError(err) ? err.kind : 'exception',
        http_status: isAppError(err) ? err.status : undefined,
        correlation_id: isAppError(err) ? err.correlationId : undefined,
        stack: err instanceof Error ? this.trimStack(err.stack) : undefined,
        route: this.currentRoute()
      });
    }

    // Keep the default behaviour so the console still shows it in development.
    console.error(err);
  }

  private unwrap(error: unknown): unknown {
    // Promise rejections come wrapped by zone.js as { rejection, promise, zone, task }.
    if (error && typeof error === 'object' && 'rejection' in error) {
      return (error as { rejection: unknown }).rejection;
    }
    return error;
  }

  private messageOf(err: unknown): string {
    if (isAppError(err)) return `${err.method} ${err.url} -> ${err.status} ${err.code ?? ''}`.trim();
    if (err instanceof Error) return err.message;
    return String(err);
  }

  private isChunkLoadError(message: string): boolean {
    return /Loading chunk [\w-]+ failed|ChunkLoadError|Failed to fetch dynamically imported module/i.test(message);
  }

  /** A deploy just happened and this tab has the old index.html. A reload fixes it; the SW update flow normally gets there first. */
  private onChunkLoadFailure(): void {
    const key = 'mol.chunk-reload-at';
    const last = Number(sessionStorage.getItem(key) ?? 0);
    if (Date.now() - last < 60_000) {
      // Already reloaded in the last minute and it is still broken: stop looping and show the error page.
      this.zone.run(() => void this.injector.get(Router).navigate(['/error'], { queryParams: { reason: 'chunk' } }));
      return;
    }
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  }

  /** Same message more than five times a minute is one problem, not five. */
  private isDuplicate(message: string): boolean {
    const now = Date.now();
    const seen = this.recentFingerprints.get(message);
    if (seen && now - seen < 60_000) {
      return true;
    }
    this.recentFingerprints.set(message, now);
    if (this.recentFingerprints.size > 50) {
      const oldest = this.recentFingerprints.keys().next().value;
      this.recentFingerprints.delete(oldest);
    }
    return false;
  }

  private trimStack(stack?: string): string | undefined {
    return stack?.split('\n').slice(0, 12).join('\n');
  }

  private currentRoute(): string {
    try {
      // Mask ids the same way Lantern does so the route is a page name, not a customer identifier.
      return this.injector.get(Router).url.replace(/\/(ACC|CUS|CRD|PAY|TXN|MSG)-[A-Za-z0-9]+/g, '/:id');
    } catch {
      return 'unknown';
    }
  }
}
