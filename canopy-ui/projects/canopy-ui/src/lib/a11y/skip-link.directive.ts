import { Directive, ElementRef, HostListener, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Renders the host anchor as a visually hidden "skip to content" link that becomes visible on
 * focus, and moves focus to the target region when activated. Required by GIS-STD-014 §10 on
 * every authenticated page.
 *
 *   <a cnSkipLink="main-content">Skip to main content</a>
 */
@Directive({
  selector: 'a[cnSkipLink]',
  host: {
    class: 'cn-skip-link',
    '[attr.href]': '"#" + cnSkipLink'
  }
})
export class CnSkipLinkDirective implements OnInit {
  @Input() cnSkipLink = 'main-content';

  constructor(private readonly el: ElementRef<HTMLAnchorElement>,
              private readonly renderer: Renderer2,
              @Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    if (!this.el.nativeElement.textContent?.trim()) {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', 'Skip to main content');
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const target = this.document.getElementById(this.cnSkipLink);
    if (!target) {
      return;
    }
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus();
    target.scrollIntoView({ block: 'start' });
  }
}
