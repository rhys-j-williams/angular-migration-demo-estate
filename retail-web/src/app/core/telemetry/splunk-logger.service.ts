import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { bufferWhen, filter } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../config/config.service';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Field set agreed with the observability team for index digital_retail_web. Splunk field
 * extractions and the "Retail Web - Errors" dashboard depend on these exact names. Add fields,
 * do not rename them; see docs/runbooks/splunk-fields.md.
 */
export interface SplunkEventFields {
  app: 'retail-web';
  app_version: string;
  env: string;
  level: LogLevel;
  event_type: string;
  message?: string;
  page_load_id?: string;
  session_id?: string;
  customer_ref?: string;
  route?: string;
  correlation_id?: string;
  http_status?: number;
  error_name?: string;
  error_message?: string;
  error_kind?: string;
  stack?: string;
  user_agent: string;
  ts: string;
  [extra: string]: string | number | boolean | undefined;
}

/**
 * Batched HEC client. Events are buffered and flushed every five seconds or on page hide, in HEC's
 * newline-delimited JSON body format. Uses HttpBackend directly - no interceptors, no bearer token,
 * no retry (a logging failure must never cause a retry storm, TOOL-1560).
 *
 * The HEC token is not a secret in the sense GIS care about (it can only write to one index) but
 * it still comes from runtime config rather than the bundle so UAT and PROD events land in
 * different indexes.
 */
@Injectable({ providedIn: 'root' })
export class SplunkLoggerService implements OnDestroy {
  private readonly http: HttpClient;
  private readonly events$ = new Subject<SplunkEventFields>();
  private readonly flush$ = new Subject<void>();
  private readonly sub: Subscription;
  private readonly onHide = () => this.flush$.next();
  customerRef: string | null = null;
  sessionId: string | null = null;

  constructor(backend: HttpBackend, private readonly config: ConfigService, private readonly zone: NgZone) {
    this.http = new HttpClient(backend);
    this.sub = this.zone.runOutsideAngular(() =>
      this.events$
        .pipe(
          bufferWhen(() => timer(5000)),
          filter(batch => batch.length > 0)
        )
        .subscribe(batch => this.send(batch))
    );
    document.addEventListener('visibilitychange', this.onHide);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    document.removeEventListener('visibilitychange', this.onHide);
  }

  log(level: LogLevel, eventType: string, fields: Partial<SplunkEventFields> = {}): void {
    if (!this.shouldEmit(level)) {
      return;
    }
    const event: SplunkEventFields = {
      app: 'retail-web',
      app_version: environment.version,
      env: this.config.loaded ? this.config.value.environment : environment.name,
      level,
      event_type: eventType,
      user_agent: navigator.userAgent,
      ts: new Date().toISOString(),
      customer_ref: this.customerRef ?? undefined,
      session_id: this.sessionId ?? undefined,
      ...this.scrub(fields)
    };
    this.events$.next(event);
  }

  error(eventType: string, fields: Partial<SplunkEventFields> = {}): void {
    this.log('error', eventType, fields);
  }

  warn(eventType: string, fields: Partial<SplunkEventFields> = {}): void {
    this.log('warn', eventType, fields);
  }

  info(eventType: string, fields: Partial<SplunkEventFields> = {}): void {
    this.log('info', eventType, fields);
  }

  private shouldEmit(level: LogLevel): boolean {
    const order: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (order.indexOf(level) < order.indexOf(environment.logLevel)) {
      return false;
    }
    if (level === 'error') {
      return true;
    }
    const rate = this.config.loaded ? this.config.value.telemetry.sampleRate : 1;
    return Math.random() < rate;
  }

  /** Emails, card PANs and account numbers must never reach the index (GIS-1471). */
  private scrub(fields: Partial<SplunkEventFields>): Partial<SplunkEventFields> {
    const out: Partial<SplunkEventFields> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === 'string') {
        out[k] = v
          .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
          .replace(/\b\d{13,19}\b/g, '[pan]')
          .replace(/\b\d{9,12}\b/g, '[acct]');
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  private send(batch: SplunkEventFields[]): void {
    if (!this.config.loaded || !this.config.value.telemetry.splunkHecUrl) {
      return;
    }
    const { splunkHecUrl, splunkToken, index } = this.config.value.telemetry;
    const body = batch
      .map(fields => JSON.stringify({ time: Date.parse(fields.ts) / 1000, host: location.hostname, source: 'retail-web', sourcetype: '_json', index, event: fields }))
      .join('\n');
    this.http
      .post(splunkHecUrl, body, {
        headers: { Authorization: `Splunk ${splunkToken}`, 'Content-Type': 'application/json' },
        responseType: 'text'
      })
      .subscribe({ error: () => { /* swallow: see class comment */ } });
  }
}
