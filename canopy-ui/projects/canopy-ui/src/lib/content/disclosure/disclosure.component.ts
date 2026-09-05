import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { CnContentService } from './content.service';

/**
 * Renders a legal disclosure or regulatory notice from the content service by key: fee schedules,
 * Reg E notices, rate disclaimers, the FDIC footer. Content owners publish in the CMS and the
 * apps pick it up without a release.
 *
 *   <cn-disclosure key="deposits.reg-dd.summary" tone="muted"></cn-disclosure>
 *
 * Inline `html` can be passed instead of a key for content that ships with the app.
 */
@Component({
  selector: 'cn-disclosure',
  templateUrl: './disclosure.component.html',
  styleUrls: ['./disclosure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-disclosure', '[attr.data-cn-tone]': 'tone', '[class.cn-disclosure--collapsible]': 'collapsible' }
})
export class CnDisclosureComponent implements OnChanges, OnDestroy {
  @Input() key: string | null = null;
  @Input() html: string | null = null;
  @Input() heading: string | null = null;
  @Input() tone: 'default' | 'muted' | 'boxed' = 'default';
  @Input() collapsible = false;
  @Input() expanded = false;

  content: SafeHtml | null = null;
  version: string | null = null;
  loading = false;

  private sub?: Subscription;

  constructor(private readonly contentService: CnContentService, private readonly sanitizer: DomSanitizer, private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['html'] && this.html !== null) {
      this.setHtml(this.html, 'inline');
    } else if (changes['key'] && this.key) {
      this.fetch(this.key);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggle(): void {
    this.expanded = !this.expanded;
  }

  private fetch(key: string): void {
    this.sub?.unsubscribe();
    this.loading = true;
    this.sub = this.contentService.fragment(key).subscribe({
      next: fragment => {
        this.setHtml(fragment.html, fragment.version);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.content = null;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private setHtml(html: string, version: string): void {
    // Disclosure copy is authored by Legal in the bank's own CMS and published through the content
    // platform, which is an internal, authenticated service. The markup is trusted first-party
    // content (it needs its tables, footnote anchors and superscripts intact), so we bypass the
    // sanitizer here rather than lose the formatting Legal signed off on.
    this.content = this.sanitizer.bypassSecurityTrustHtml(html);
    this.version = version;
  }
}
