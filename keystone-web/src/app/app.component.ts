import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CnIconRegistry } from '@meridian/canopy-ui/icons';

@Component({
  selector: 'ks-root',
  template: `
    <ks-maintenance-notice></ks-maintenance-notice>
    <ks-brand-header></ks-brand-header>
    <main class="ks-main" id="main">
      <router-outlet></router-outlet>
    </main>
    <ks-legal-footer></ks-legal-footer>
  `,
  styles: [`.ks-main { padding: 32px 16px 0; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private readonly icons: CnIconRegistry) {}

  ngOnInit(): void {
    // Sprite is copied to assets/canopy by angular.json. Registering here rather than in
    // CoreModule so the icon registry does not go looking for it during APP_INITIALIZER.
    this.icons.register();
  }
}
