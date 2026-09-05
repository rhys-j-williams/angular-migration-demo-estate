import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { StatementsApiService } from '../../../../core/api/statements-api.service';
import { Account } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { accountsActions } from '../../../accounts/store/accounts.actions';
import { accountsSelectors } from '../../../accounts/store/accounts.selectors';

/**
 * Per-account paperless enrolment. The E-SIGN consent is recorded server-side on the first opt-in;
 * we surface the disclosure link but the BFF owns the consent record (MOL-2760, Compliance).
 */
@Component({
  selector: 'mol-paperless-settings',
  templateUrl: './paperless-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaperlessSettingsComponent implements OnInit {
  readonly accounts$: Observable<Account[]> = this.store.select(accountsSelectors.selectAll).pipe(map(list => list.filter(a => a.status !== 'closed')));
  /** Local overlay until the accounts DTO carries a paperless flag (PLAT-2311). */
  paperless = new Map<string, boolean>();
  saving = new Set<string>();

  constructor(
    private readonly store: Store,
    private readonly api: StatementsApiService,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.store.dispatch(accountsActions.load());
  }

  isPaperless(a: Account): boolean {
    return this.paperless.get(a.accountId) ?? true;
  }

  toggle(a: Account, next: boolean): void {
    if (this.saving.has(a.accountId)) return;
    const before = this.isPaperless(a);
    this.paperless.set(a.accountId, next);
    this.saving.add(a.accountId);
    this.api.setPaperless(a.accountId, next).subscribe({
      next: res => {
        this.paperless.set(res.accountId, res.paperless);
        this.saving.delete(a.accountId);
        this.lantern.track('statements.paperless.changed', { paperless: res.paperless });
        if (!res.paperless) this.toast.caution($localize`:@@statements.paperless.mailNote:Paper statements are mailed to the address on your profile. A monthly fee may apply to some accounts.`);
        this.cdr.markForCheck();
      },
      error: (err: AppError) => {
        this.paperless.set(a.accountId, before);
        this.saving.delete(a.accountId);
        this.toast.error(err.title);
        this.cdr.markForCheck();
      }
    });
  }

  allPaperless(accounts: Account[]): boolean {
    return accounts.every(a => this.isPaperless(a));
  }

  enrolAll(accounts: Account[]): void {
    accounts.filter(a => !this.isPaperless(a)).forEach(a => this.toggle(a, true));
  }
}
