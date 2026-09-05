import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertHistoryItem } from '../../../../core/api/models';

/** Unread alerts since last sign-in, newest first, capped at five. */
@Component({
  selector: 'mol-alerts-digest',
  templateUrl: './alerts-digest.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsDigestComponent implements OnInit {
  items$!: Observable<AlertHistoryItem[]>;
  dismissed = new Set<string>();

  constructor(private readonly api: AlertsApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.items$ = this.api.history(1, 20).pipe(
      map(list => list.filter(i => !i.read).slice(0, 5)),
      catchError(() => of([] as AlertHistoryItem[]))
    );
  }

  dismiss(item: AlertHistoryItem): void {
    this.dismissed.add(item.id);
    this.api.markRead([item.id]).subscribe({ error: () => { this.dismissed.delete(item.id); this.cdr.markForCheck(); } });
  }

  visible(items: AlertHistoryItem[]): AlertHistoryItem[] {
    return items.filter(i => !this.dismissed.has(i.id));
  }

  iconFor(code: string): string {
    if (code.startsWith('security.')) return 'shield';
    if (code.startsWith('balance.')) return 'account_balance_wallet';
    if (code.startsWith('card.')) return 'credit_card';
    return 'notifications';
  }
}
