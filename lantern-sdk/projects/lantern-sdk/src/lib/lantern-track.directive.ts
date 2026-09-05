import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { LanternProperties } from './lantern.vendor';
import { LanternService } from './lantern.service';

/**
 * Click tracking.
 *
 *   <button lanternTrack="transfer.submit" [lanternProps]="{ amountBand: band }">Send</button>
 *
 * With no event name we fall back to the element's data-lantern-event attribute, then to
 * `click:<tag>#<id>`; the fallback exists because the Canopy button wrapped the host element and
 * the attribute did not always land where people expected (CNPY-1032).
 *
 * Note for the migration: this is a View Engine directive with a HostListener; the metadata.json
 * that ngcc needs to process it comes out of the prod build (see tsconfig.lib.prod.json).
 */
@Directive({
  selector: '[lanternTrack]',
  exportAs: 'lanternTrack'
})
export class LanternTrackDirective {
  @Input('lanternTrack') eventName: string | undefined;
  @Input() lanternProps: LanternProperties | undefined;
  /** set to false to attach the directive without sending anything, handy behind feature flags */
  @Input() lanternEnabled = true;

  constructor(private readonly lantern: LanternService, private readonly el: ElementRef<HTMLElement>) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.lanternEnabled) {
      return;
    }
    const host = this.el.nativeElement;
    const name = this.eventName || host.getAttribute('data-lantern-event') || defaultName(host);
    const text = (host.textContent || '').trim();
    this.lantern.track(name, {
      ...(this.lanternProps || {}),
      elementTag: host.tagName.toLowerCase(),
      elementId: host.id || null,
      // labels are capped and never include numbers; a masked card number on a button label was
      // GIS-1471 finding 5
      elementText: text.replace(/[0-9]/g, '#').slice(0, 40),
      altKey: event.altKey || false
    });
  }
}

function defaultName(host: HTMLElement): string {
  return 'click:' + host.tagName.toLowerCase() + (host.id ? '#' + host.id : '');
}
