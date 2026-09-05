import { LiveAnnouncer, AriaLivePoliteness } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, Injectable, OnDestroy, ViewEncapsulation } from '@angular/core';

/**
 * Thin service over the CDK LiveAnnouncer with the bank's defaults (polite, cleared after 5s).
 * Injected by the toast, the error summary and the data table so screen reader users hear what
 * sighted users see.
 */
@Injectable({ providedIn: 'root' })
export class CnA11yAnnouncerService {
  constructor(private readonly liveAnnouncer: LiveAnnouncer) {}

  announce(message: string, politeness: AriaLivePoliteness = 'polite', duration = 5000): Promise<void> {
    if (!message) {
      return Promise.resolve();
    }
    return this.liveAnnouncer.announce(message, politeness, duration);
  }

  clear(): void {
    this.liveAnnouncer.clear();
  }
}

/**
 * Declarative host for the announcer. Drop one `<cn-a11y-announcer>` into the application shell
 * so the CDK live region exists before the first route resolves; screen readers on the VDI estate
 * miss the first announcement otherwise (CNPY-1288).
 */
@Component({
  selector: 'cn-a11y-announcer',
  template: '<span class="cdk-visually-hidden" aria-hidden="true">{{ lastMessage }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-a11y-announcer' }
})
export class CnA11yAnnouncerComponent implements OnDestroy {
  lastMessage = '';

  constructor(private readonly announcer: CnA11yAnnouncerService) {}

  announce(message: string, politeness: AriaLivePoliteness = 'polite'): Promise<void> {
    this.lastMessage = message;
    return this.announcer.announce(message, politeness);
  }

  ngOnDestroy(): void {
    this.announcer.clear();
  }
}
