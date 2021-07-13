import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { StatementsApiService } from '../../../../core/api/statements-api.service';
import { Statement } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { StatementListComponent } from '../statement-list/statement-list.component';

/**
 * 1099-INT and 1098 forms by tax year. Forms are posted by 31 January; before then the year shows
 * an "expected" row so customers stop calling the contact centre in the first week of January.
 */
@Component({
  selector: 'mol-tax-documents',
  templateUrl: './tax-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxDocumentsComponent implements OnInit {
  readonly now = new Date();
  readonly latestTaxYear = this.now.getFullYear() - 1;
  readonly years = [0, 1, 2].map(i => this.latestTaxYear - i);
  year = this.latestTaxYear;
  docs$!: Observable<Statement[]>;
  busyId: string | null = null;

  constructor(
    private readonly api: StatementsApiService,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.select(this.year);
  }

  select(year: number): void {
    this.year = year;
    this.docs$ = this.api.taxDocuments(year).pipe(map(list => list.filter(d => d.type === 'tax-1099-int' || d.type === 'tax-1098')));
  }

  get formsPending(): boolean {
    return this.year === this.latestTaxYear && this.now.getMonth() === 0;
  }

  formLabel(d: Statement): string {
    return d.type === 'tax-1098' ? $localize`:@@statements.tax.f1098:Form 1098 mortgage interest` : $localize`:@@statements.tax.f1099:Form 1099-INT interest income`;
  }

  download(d: Statement): void {
    this.busyId = d.statementId;
    this.api.download(d.statementId).subscribe({
      next: blob => {
        StatementListComponent.saveBlob(blob, `meridian-${d.type}-${this.year}.pdf`);
        this.lantern.track('statements.tax.downloaded', { type: d.type, year: this.year });
        this.busyId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.busyId = null;
        this.toast.error($localize`:@@statements.tax.failed:We could not fetch that form right now.`);
        this.cdr.markForCheck();
      }
    });
  }
}
