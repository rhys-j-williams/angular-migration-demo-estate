import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { StatementsApiService } from '../../../../core/api/statements-api.service';
import { Account, Statement } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { accountsActions } from '../../../accounts/store/accounts.actions';
import { accountsSelectors } from '../../../accounts/store/accounts.selectors';
import { statementsActions } from '../../store/statements.actions';
import { statementsSelectors } from '../../store/statements.selectors';

interface FilterForm {
  accountId: FormControl<string>;
  year: FormControl<number>;
}

/**
 * Statements by account and year with download. Downloads go through the BFF as a blob so the
 * XSRF and auth interceptors apply; the old direct-to-documents-service link leaked the bearer
 * token into the browser history (GIS-2094).
 */
@Component({
  selector: 'mol-statement-list',
  templateUrl: './statement-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementListComponent implements OnInit {
  readonly currentYear = new Date().getFullYear();
  readonly years: CnSelectOption<number>[] = Array.from({ length: 7 }, (_, i) => this.currentYear - i).map(y => ({ value: y, label: String(y) }));
  readonly form: FormGroup<FilterForm> = this.fb.group({
    accountId: this.fb.control(''),
    year: this.fb.control(this.currentYear)
  });
  accountOptions$!: Observable<CnSelectOption<string>[]>;
  statements$!: Observable<Statement[]>;
  readonly loading$ = this.store.select(statementsSelectors.selectLoading);
  readonly error$ = this.store.select(statementsSelectors.selectError);
  downloading = new Set<string>();

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly store: Store,
    private readonly api: StatementsApiService,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.store.dispatch(accountsActions.load());
    this.store.dispatch(statementsActions.load());

    this.accountOptions$ = this.store.select(accountsSelectors.selectAll).pipe(
      map(accounts => [{ value: '', label: 'All accounts' }, ...accounts.map(a => ({ value: a.accountId, label: a.nickname, description: 'Ending ' + a.accountNumber.slice(-4) }))])
    );

    this.statements$ = combineLatest([
      this.store.select(statementsSelectors.selectAll),
      this.form.valueChanges.pipe(startWith(this.form.getRawValue()), map(() => this.form.getRawValue()))
    ]).pipe(map(([all, f]) => StatementListComponent.filter(all, f.accountId, f.year)));
  }

  retry(): void {
    this.store.dispatch(statementsActions.invalidate());
    this.store.dispatch(statementsActions.load());
  }

  async download(s: Statement): Promise<void> {
    if (this.downloading.has(s.statementId)) return;
    this.downloading.add(s.statementId);
    this.cdr.markForCheck();
    try {
      const blob = await this.api.download(s.statementId).toPromise();
      if (blob) StatementListComponent.saveBlob(blob, StatementListComponent.fileName(s));
      this.lantern.track('statements.downloaded', { type: s.type, pages: s.pages });
    } catch {
      this.toast.error($localize`:@@statements.list.downloadFailed:We could not fetch that statement. Try again in a moment.`);
    } finally {
      this.downloading.delete(s.statementId);
      this.cdr.markForCheck();
    }
  }

  accountLabel(accounts: Account[] | null, id: string): string {
    return accounts?.find(a => a.accountId === id)?.nickname ?? id;
  }

  trackById(_: number, s: Statement): string {
    return s.statementId;
  }

  static filter(all: Statement[], accountId: string, year: number): Statement[] {
    return all
      .filter(s => s.type === 'monthly' || s.type === 'annual' || s.type === 'notice')
      .filter(s => !accountId || s.accountId === accountId)
      .filter(s => new Date(s.periodEnd).getFullYear() === year)
      .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  }

  static fileName(s: Statement): string {
    return `meridian-${s.type}-${s.periodEnd.slice(0, 10)}.pdf`;
  }

  static saveBlob(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
