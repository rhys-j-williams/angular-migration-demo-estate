import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { RateLimitStateService } from '../../../core/http/rate-limit-state.service';

interface BannerView {
  visible: boolean;
  heading: string;
  seconds: number;
}

/**
 * Shown when the IdP returns 429. Copy signed off by Fraud and Legal in KEY-1088: we say "too
 * many attempts", never "wrong password too many times", because the limit is also per IP and the
 * customer may not be the one attempting.
 */
@Component({
  selector: 'ks-rate-limit-banner',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="view$ | async as v" class="ks-ratelimit" role="alert" [class.ks-ratelimit--hidden]="!v.visible" [attr.aria-hidden]="!v.visible">
      <ng-container *ngIf="v.visible">
        <mat-icon svgIcon="cn:alert" aria-hidden="true"></mat-icon>
        <div>
          <strong>{{ v.heading }}</strong>
          <p *ngIf="v.seconds > 0; else clear">
            For your security, please wait {{ v.seconds }} second{{ v.seconds === 1 ? '' : 's' }} before trying again.
          </p>
          <ng-template #clear><p>You can try again now.</p></ng-template>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./rate-limit-banner.component.scss'],
})
export class RateLimitBannerComponent {
  readonly view$: Observable<BannerView>;

  constructor(private readonly rateLimit: RateLimitStateService) {
    this.view$ = combineLatest([rateLimit.state, rateLimit.secondsRemaining]).pipe(
      map(([state, seconds]) => ({
        visible: state.limited,
        seconds,
        heading: state.scope === 'otp' ? 'Too many code attempts' : state.scope === 'recovery' ? 'Too many recovery requests' : 'Too many sign in attempts',
      })),
    );
  }
}
