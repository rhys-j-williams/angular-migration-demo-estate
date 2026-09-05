import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-brand-header',
  standalone: true,
  imports: [NgIf, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ks-brand" role="banner">
      <a class="ks-brand__home" href="https://www.meridiantrust.example" rel="noopener">
        <img class="ks-brand__mark" src="assets/img/keystone-mark.svg" alt="" width="32" height="32" />
        <span class="ks-brand__name">Meridian Trust Bank</span>
      </a>
      <span class="ks-brand__secure" *ngIf="showLock">
        <mat-icon svgIcon="cn:lock" aria-hidden="true"></mat-icon>
        Secure sign in
      </span>
    </header>
  `,
  styleUrls: ['./brand-header.component.scss'],
})
export class BrandHeaderComponent {
  @Input() showLock = true;
}
