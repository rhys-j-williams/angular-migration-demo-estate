import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { TransactionCategory } from '../../../../core/api/models';
import { dashboardSelectors } from '../../store/dashboard.selectors';

export interface SpendSlice {
  category: TransactionCategory;
  label: string;
  minor: number;
  share: number;
  colour: string;
}

const LABELS: Partial<Record<TransactionCategory, string>> = {
  groceries: 'Groceries', dining: 'Dining', fuel: 'Fuel', travel: 'Travel', utilities: 'Utilities',
  healthcare: 'Healthcare', entertainment: 'Entertainment', insurance: 'Insurance',
  'home-improvement': 'Home', education: 'Education', charity: 'Giving', fees: 'Fees', taxes: 'Taxes'
};
const PALETTE = ['#1f5f8b', '#2e8b57', '#c98a1b', '#8b3a62', '#5f6f8b', '#b8562e'];

/**
 * Spend by category for the current calendar month, primary checking account only. Drawn as a
 * conic-gradient doughnut in CSS rather than a chart library: Canopy has no chart component and
 * we were told not to add a third one (CNPY-1780). Excludes transfers and income.
 */
@Component({
  selector: 'mol-spending-snapshot',
  templateUrl: './spending-snapshot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingSnapshotComponent implements OnInit {
  slices$!: Observable<SpendSlice[] | null>;
  total = 0;

  constructor(private readonly store: Store, private readonly api: AccountsApiService) {}

  ngOnInit(): void {
    const monthStart = new Date();
    monthStart.setDate(1);
    this.slices$ = this.store.select(dashboardSelectors.selectAll).pipe(
      map(all => all.find(a => a.type === 'checking')),
      filter(a => a !== undefined),
      take(1),
      switchMap(a =>
        this.api.transactions({ accountId: a!.accountId, from: monthStart.toISOString().slice(0, 10), page: 1, pageSize: 200 }).pipe(
          map(page => this.aggregate(page.items.filter(t => t.amountMinor < 0 && t.category !== 'transfers').map(t => [t.category, -t.amountMinor] as const))),
          catchError(() => of([] as SpendSlice[]))
        )
      )
    );
  }

  gradient(slices: SpendSlice[]): string {
    let acc = 0;
    const stops = slices.map(s => {
      const from = acc;
      acc += s.share;
      return `${s.colour} ${from}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  private aggregate(rows: readonly (readonly [TransactionCategory, number])[]): SpendSlice[] {
    const totals = new Map<TransactionCategory, number>();
    for (const [cat, minor] of rows) totals.set(cat, (totals.get(cat) ?? 0) + minor);
    this.total = [...totals.values()].reduce((a, b) => a + b, 0);
    const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const rest = this.total - top.reduce((a, [, v]) => a + v, 0);
    const out: SpendSlice[] = top.map(([category, minor], i) => ({
      category, minor, label: LABELS[category] ?? category, share: this.total ? Math.round((minor / this.total) * 100) : 0, colour: PALETTE[i]
    }));
    if (rest > 0) out.push({ category: 'fees', label: 'Everything else', minor: rest, share: Math.round((rest / this.total) * 100), colour: PALETTE[5] });
    return out;
  }
}
