import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ks-legal-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="ks-footer" role="contentinfo">
      <nav aria-label="Legal">
        <a class="ks-link" href="https://www.meridiantrust.example/privacy" rel="noopener">Privacy</a>
        <a class="ks-link" href="https://www.meridiantrust.example/security" rel="noopener">Security</a>
        <a class="ks-link" href="https://www.meridiantrust.example/accessibility" rel="noopener">Accessibility</a>
      </nav>
      <p class="ks-footer__legal">
        Meridian Trust Bank, N.A. Member FDIC. Equal Housing Lender. &copy; {{ year }}
      </p>
      <p class="ks-footer__build" aria-hidden="true">{{ build }}</p>
    </footer>
  `,
  styles: [
    `
      .ks-footer { color: #52606d; font-size: 13px; margin: 32px auto 24px; max-width: 440px; padding: 0 16px; text-align: center; }
      .ks-footer nav { display: flex; gap: 16px; justify-content: center; margin-bottom: 8px; }
      .ks-footer__legal { margin: 0; }
      .ks-footer__build { color: #9aa5b1; font-size: 11px; margin: 4px 0 0; }
    `,
  ],
})
export class LegalFooterComponent {
  readonly year = new Date().getFullYear();
  // Replaced by the Jenkins stage with the short sha; the UAT smoke test greps for it.
  readonly build = 'build ${BUILD_SHA}';
}
