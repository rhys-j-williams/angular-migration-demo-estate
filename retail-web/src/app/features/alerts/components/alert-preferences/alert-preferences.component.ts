import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertPreference } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { alertsActions } from '../../store/alerts.actions';
import { alertsSelectors } from '../../store/alerts.selectors';

export interface AlertGroup {
  id: string;
  title: string;
  blurb: string;
  items: AlertPreference[];
}

const GROUPS: { id: string; prefix: string; title: string; blurb: string }[] = [
  { id: 'security', prefix: 'security.', title: 'Security', blurb: 'Sign-ins, new devices, password and contact changes. Required.' },
  { id: 'balance', prefix: 'balance.', title: 'Balances', blurb: 'Low balance, large deposits and overdraft warnings.' },
  { id: 'transactions', prefix: 'transaction.', title: 'Transactions', blurb: 'Card purchases, declines and transfers above an amount you choose.' },
  { id: 'card', prefix: 'card.', title: 'Cards', blurb: 'Card locked, card used abroad, card not present.' },
  { id: 'payments', prefix: 'payment.', title: 'Bills and payments', blurb: 'Bills due, payments sent, payments failed.' },
  { id: 'statements', prefix: 'statement.', title: 'Statements and documents', blurb: 'Statement ready, tax forms available.' }
];

/**
 * Grouped alert toggles with channel selection and thresholds. Regulatory alerts (Reg E, Reg DD
 * and the CAN-SPAM opt-out record) render but cannot be disabled; the BFF enforces that too, this
 * is only the UI half. Updates are optimistic with a rollback on failure.
 */
@Component({
  selector: 'mol-alert-preferences',
  templateUrl: './alert-preferences.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPreferencesComponent implements OnInit {
  readonly groups$: Observable<AlertGroup[]> = this.store.select(alertsSelectors.selectAll).pipe(map(items => AlertPreferencesComponent.group(items)));
  readonly loading$ = this.store.select(alertsSelectors.selectLoading);
  readonly error$ = this.store.select(alertsSelectors.selectError);
  saving = new Set<string>();

  constructor(
    private readonly store: Store,
    private readonly api: AlertsApiService,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(alertsActions.load());
  }

  retry(): void {
    this.store.dispatch(alertsActions.invalidate());
    this.store.dispatch(alertsActions.load());
  }

  update(before: AlertPreference, change: Partial<Pick<AlertPreference, 'enabled' | 'channels' | 'thresholdMinor'>>): void {
    if (before.regulatory && change.enabled === false) {
      this.toast.caution($localize`:@@alerts.prefs.regulatory:This alert is required and cannot be turned off.`);
      return;
    }
    this.saving.add(before.alertId);
    this.store.dispatch(alertsActions.upsert({ item: { ...before, ...change } }));
    this.api.updatePreference(before.alertId, change).subscribe({
      next: saved => {
        this.saving.delete(before.alertId);
        this.store.dispatch(alertsActions.upsert({ item: saved }));
        this.lantern.track('alerts.preference.updated', { code: before.code, enabled: saved.enabled, channels: saved.channels.length });
      },
      error: (err: AppError) => {
        this.saving.delete(before.alertId);
        this.store.dispatch(alertsActions.upsert({ item: before }));
        this.toast.error(err.title);
      }
    });
  }

  trackByGroup(_: number, g: AlertGroup): string {
    return g.id;
  }

  static group(items: AlertPreference[]): AlertGroup[] {
    const out: AlertGroup[] = GROUPS.map(g => ({ id: g.id, title: g.title, blurb: g.blurb, items: items.filter(i => i.code.startsWith(g.prefix)) }));
    const known = new Set(out.flatMap(g => g.items.map(i => i.alertId)));
    const other = items.filter(i => !known.has(i.alertId));
    if (other.length) out.push({ id: 'other', title: 'Other', blurb: '', items: other });
    return out.filter(g => g.items.length);
  }
}
