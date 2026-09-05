import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { CardsApiService } from '../../../../core/api/cards-api.service';
import { Card, CardControls } from '../../../../core/api/models';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfigService } from '../../../../core/config/config.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { cardsActions } from '../../store/cards.actions';
import { cardsSelectors } from '../../store/cards.selectors';

/**
 * Card artwork, status, controls entry and reveal. Reveal needs a fresh MFA claim (same rule as
 * transfers) and the number is wiped from the component after the BFF's `expiresIn` seconds; it
 * is never written to the store, Lantern, or any storage.
 */
@Component({
  selector: 'mol-card-detail',
  templateUrl: './card-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardDetailComponent implements OnInit, OnDestroy {
  readonly cardId = this.route.snapshot.paramMap.get('cardId') ?? '';
  readonly card$: Observable<Card | undefined> = this.store.select(cardsSelectors.selectEntities).pipe(map(e => e[this.cardId]));
  controls: CardControls | null = null;
  revealed: { cardNumber: string; cvv: string } | null = null;
  revealSecondsLeft = 0;
  revealError: AppError | null = null;
  busy = false;
  private countdown?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store,
    private readonly api: CardsApiService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.store.dispatch(cardsActions.load());
    this.store.dispatch(cardsActions.select({ id: this.cardId }));
    this.lantern.track('cards.detail.viewed');
    void this.loadControls();
  }

  ngOnDestroy(): void {
    this.hide();
  }

  async loadControls(): Promise<void> {
    try {
      this.controls = await this.api.controls(this.cardId).toPromise() ?? null;
    } catch {
      this.controls = null; // the controls page shows its own error; here it is only a summary line
    }
    this.cdr.markForCheck();
  }

  async reveal(): Promise<void> {
    if (!this.auth.hasRecentMfa(this.config.value.transfers.mfaMaxAgeSeconds)) {
      this.auth.stepUp(this.router.url);
      return;
    }
    this.busy = true;
    this.revealError = null;
    try {
      const res = await this.api.reveal(this.cardId).toPromise();
      if (!res) return;
      this.revealed = { cardNumber: res.cardNumber, cvv: res.cvv };
      this.revealSecondsLeft = res.expiresIn;
      this.lantern.track('cards.revealed');
      this.countdown = timer(1000, 1000).subscribe(() => {
        this.revealSecondsLeft -= 1;
        if (this.revealSecondsLeft <= 0) this.hide();
        this.cdr.markForCheck();
      });
    } catch (err) {
      this.revealError = err as AppError;
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  hide(): void {
    this.countdown?.unsubscribe();
    this.countdown = undefined;
    this.revealed = null;
    this.revealSecondsLeft = 0;
  }

  grouped(pan: string): string {
    return pan.replace(/(.{4})/g, '$1 ').trim();
  }

  controlsSummary(c: CardControls): string {
    const off: string[] = [];
    if (!c.internationalEnabled) off.push($localize`:@@cards.detail.intl:international`);
    if (!c.onlineEnabled) off.push($localize`:@@cards.detail.online:online`);
    if (!c.atmEnabled) off.push($localize`:@@cards.detail.atm:ATM`);
    if (!c.contactlessEnabled) off.push($localize`:@@cards.detail.contactless:contactless`);
    return off.length ? $localize`:@@cards.detail.off:Off: ${off.join(', ')}:list:` : $localize`:@@cards.detail.allOn:All purchase types allowed`;
  }
}
