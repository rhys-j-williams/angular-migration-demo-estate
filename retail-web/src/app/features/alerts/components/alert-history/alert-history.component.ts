import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, scan, switchMap, tap } from 'rxjs/operators';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertHistoryItem } from '../../../../core/api/models';

const PAGE = 50;

/** Alerts sent in the last 90 days, infinite-scroll style "show more". */
@Component({
  selector: 'mol-alert-history',
  templateUrl: './alert-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertHistoryComponent implements OnInit {
  items$!: Observable<AlertHistoryItem[]>;
  exhausted = false;
  private readonly page$ = new BehaviorSubject<number>(1);

  constructor(private readonly api: AlertsApiService) {}

  ngOnInit(): void {
    this.items$ = this.page$.pipe(
      switchMap(page => this.api.history(page, PAGE)),
      tap(batch => (this.exhausted = batch.length < PAGE)),
      scan((all, batch) => [...all, ...batch], [] as AlertHistoryItem[]),
      map(list => list.sort((a, b) => b.sentAt.localeCompare(a.sentAt)))
    );
  }

  more(): void {
    this.page$.next(this.page$.value + 1);
  }

  byDay(items: AlertHistoryItem[]): { day: string; items: AlertHistoryItem[] }[] {
    const groups = new Map<string, AlertHistoryItem[]>();
    for (const i of items) {
      const day = i.sentAt.slice(0, 10);
      groups.set(day, [...(groups.get(day) ?? []), i]);
    }
    return [...groups.entries()].map(([day, list]) => ({ day, items: list }));
  }
}
