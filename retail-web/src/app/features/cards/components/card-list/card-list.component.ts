import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { Card, CardStatus } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { cardsActions } from '../../store/cards.actions';
import { cardsSelectors } from '../../store/cards.selectors';
import { LockCardComponent, LockCardData } from '../lock-card/lock-card.component';

/**
 * All cards with status and quick lock. The card feature was written in 2019 against RxJS 6 and
 * kept its promise-style call sites when the rest of the app moved to subscribe(); see MOL-3120.
 */
@Component({
  selector: 'mol-card-list',
  templateUrl: './card-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardListComponent implements OnInit {
  readonly cards$: Observable<Card[]> = this.store.select(cardsSelectors.selectAll).pipe(map(cards => [...cards].sort(CardListComponent.byStatus)));
  readonly loading$ = this.store.select(cardsSelectors.selectLoading);
  readonly error$ = this.store.select(cardsSelectors.selectError);

  constructor(
    private readonly store: Store,
    private readonly dialog: MatDialog,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(cardsActions.load());
  }

  retry(): void {
    this.store.dispatch(cardsActions.invalidate());
    this.store.dispatch(cardsActions.load());
  }

  async toggleLock(card: Card): Promise<void> {
    const locked = card.status !== 'locked';
    const data: LockCardData = { cardId: card.cardId, locked };
    const confirmed = await this.dialog.open<LockCardComponent, LockCardData, boolean>(LockCardComponent, { data, width: '440px' }).afterClosed().toPromise();
    if (!confirmed) return;
    this.store.dispatch(cardsActions.upsert({ item: { ...card, status: locked ? 'locked' : 'active' } }));
    this.lantern.track(locked ? 'cards.locked' : 'cards.unlocked', { network: card.network });
    this.toast.success(locked ? $localize`:@@cards.list.locked:Card locked` : $localize`:@@cards.list.unlocked:Card unlocked`);
  }

  last4(card: Card): string {
    return card.cardNumber.slice(-4);
  }

  statusTone(status: CardStatus): 'success' | 'caution' | 'neutral' | 'warn' {
    switch (status) {
      case 'active': return 'success';
      case 'locked': return 'caution';
      case 'replaced': return 'neutral';
      case 'expired': return 'warn';
    }
  }

  trackById(_: number, c: Card): string {
    return c.cardId;
  }

  static byStatus(a: Card, b: Card): number {
    const rank: Record<CardStatus, number> = { active: 0, locked: 1, expired: 2, replaced: 3 };
    return rank[a.status] - rank[b.status] || a.cardNumber.localeCompare(b.cardNumber);
  }
}
