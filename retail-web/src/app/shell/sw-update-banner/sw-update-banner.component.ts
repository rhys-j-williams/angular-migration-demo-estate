import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Prompts for a reload when the service worker has a new version staged. Checks every 30 minutes
 * (long lived tabs are common: customers leave the dashboard open all day) and never reloads on
 * its own; a forced reload mid-transfer was the MOL-3922 complaint.
 */
@Component({
  selector: 'mol-sw-update-banner',
  template: `
    <div class="mol-sw-banner" *ngIf="ready" role="status" fxLayout="row" fxLayout.lt-md="column" fxLayoutAlign="center center" fxLayoutGap="12px">
      <span i18n="@@sw.ready">A new version of Meridian Online is available.</span>
      <cn-button variant="secondary" size="small" (pressed)="reload()" i18n="@@sw.reload">Refresh now</cn-button>
      <cn-button variant="tertiary" size="small" (pressed)="ready = false" i18n="@@sw.later">Later</cn-button>
    </div>
  `,
  styles: [`.mol-sw-banner { padding: 8px 16px; background: var(--cn-color-primary-container, #e3ecf7); }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwUpdateBannerComponent implements OnInit, OnDestroy {
  ready = false;
  private subs = new Subscription();

  constructor(private readonly updates: SwUpdate, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.updates.isEnabled) {
      return;
    }
    this.subs.add(
      this.updates.versionUpdates.pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY')).subscribe(() => {
        this.ready = true;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(interval(30 * 60 * 1000).subscribe(() => void this.updates.checkForUpdate()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  reload(): void {
    void this.updates.activateUpdate().then(() => document.location.reload());
  }
}
