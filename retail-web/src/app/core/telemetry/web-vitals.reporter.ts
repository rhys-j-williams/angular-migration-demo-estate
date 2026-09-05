import { Injectable, NgZone } from '@angular/core';
import { Metric, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

import { SplunkLoggerService } from './splunk-logger.service';

/**
 * Reports Core Web Vitals to Splunk as `web_vital` events. One event per metric per page load; the
 * observability dashboard buckets them by route. Set up once from AppComponent.
 *
 * Runs outside the Angular zone so the PerformanceObserver callbacks do not trigger change
 * detection. Values are rounded because the dashboard percentiles do not need microseconds and it
 * keeps the events small.
 */
@Injectable({ providedIn: 'root' })
export class WebVitalsReporter {
  private started = false;

  constructor(private readonly logger: SplunkLoggerService, private readonly zone: NgZone) {}

  start(): void {
    if (this.started || typeof PerformanceObserver === 'undefined') {
      return;
    }
    this.started = true;
    this.zone.runOutsideAngular(() => {
      const report = (metric: Metric) => this.report(metric);
      onCLS(report);
      onFCP(report);
      onFID(report);
      onINP(report);
      onLCP(report);
      onTTFB(report);
    });
  }

  private report(metric: Metric): void {
    this.logger.info('web_vital', {
      vital_name: metric.name,
      vital_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      vital_rating: metric.rating,
      vital_delta: Math.round(metric.delta),
      navigation_type: metric.navigationType,
      route: location.pathname.replace(/\/(ACC|CUS|CRD|PAY|TXN|MSG)-[A-Za-z0-9]+/g, '/:id')
    });
  }
}
