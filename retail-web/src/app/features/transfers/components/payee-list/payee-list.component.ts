import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CnDialogService, CnToastService } from '@meridian/canopy-ui/overlays';

import { TransfersApiService } from '../../../../core/api/transfers-api.service';
import { Payee } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';

/** External transfer payees with verification status. */
@Component({
  selector: 'mol-payee-list',
  templateUrl: './payee-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayeeListComponent implements OnInit {
  payees$!: Observable<Payee[]>;
  error: AppError | null = null;
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private readonly api: TransfersApiService,
    private readonly router: Router,
    private readonly dialog: CnDialogService,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.payees$ = this.reload$.pipe(switchMap(() => this.api.payees()));
  }

  verify(p: Payee): void {
    void this.router.navigate(['/transfers/payees', p.payeeId, 'verify']);
  }

  remove(p: Payee): void {
    this.dialog
      .confirm({
        title: $localize`:@@transfers.payees.removeTitle:Remove ${p.nickname || p.name}:name:?`,
        message: $localize`:@@transfers.payees.removeBody:Scheduled transfers to this account will be cancelled. You can add it again later, but it will need verifying again.`,
        confirmLabel: $localize`:@@action.remove:Remove`,
        destructive: true
      })
      .subscribe(ok => {
        if (!ok) return;
        this.api.deletePayee(p.payeeId).subscribe({
          next: () => { this.toast.success($localize`:@@transfers.payees.removed:Account removed`); this.reload$.next(); },
          error: (err: AppError) => { this.error = err; this.cdr.markForCheck(); }
        });
      });
  }

  typeLabel(t: Payee['type']): string {
    return t === 'paylink' ? 'PayLink contact' : t === 'bill-pay' ? 'Bill payee' : 'External account';
  }

  trackById(_: number, p: Payee): string {
    return p.payeeId;
  }
}
